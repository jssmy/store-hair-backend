import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { DataSource, Repository } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/infrastructure/user.entity';
import { LoteStatus } from './enums/lote-status.enum';
import { AuthUser } from 'src/auth/domain/auth-user.entity';
import { Product } from 'src/product/entities/product.entity';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { FindAllLoteQueryDto } from './dto/find-all-lote-query.dto';
import { PurchaseOrder } from 'src/purchase-order/entities/purchase-order.entity';
import { PurchaseOrderStatus } from 'src/purchase-order/enums/purchase-order-status.enum';

const BASE64_IMAGE_REGEX = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/]+=*)$/;
const HTTP_IMAGE_URL_REGEX = /^https?:\/\/\S+$/i;
const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class LoteService {

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,

  ) { }

  async create(
    createLoteDto: CreateLoteDto,
    authUser: AuthUser,
  ) {


    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loteRepository = queryRunner.manager.getRepository(Lote);
      const productRepository = queryRunner.manager.getRepository(Product);
      const purchaseOrderRepository = queryRunner.manager.getRepository(PurchaseOrder);

      const purchaseOrder = await purchaseOrderRepository.findOne({ where: { id: createLoteDto.purchaseOrderId } });

      if (!purchaseOrder) {
        throw new NotFoundException(`Orden de compra con ID ${createLoteDto.purchaseOrderId} no encontrada`);
      }

      if (purchaseOrder.status !== PurchaseOrderStatus.APPROVED) {
        throw new BadRequestException(`La orden de compra con ID ${createLoteDto.purchaseOrderId} no está aprobada`);
      }

      const existingLote = await loteRepository.findOne({
        where: { purchaseOrder: { id: createLoteDto.purchaseOrderId } },
      });

      if (existingLote) {
        throw new BadRequestException(
          `La orden de compra con ID ${createLoteDto.purchaseOrderId} ya está asociada al lote ${existingLote.id}`,
        );
      }

      const user = { id: authUser.id } as UserEntity;

      // 1. Guardar el lote vacío primero para obtener su ID
      const lote = await loteRepository.save(
        loteRepository.create({ user, purchaseOrder }),
      );

      await purchaseOrderRepository.update(purchaseOrder.id, { status: PurchaseOrderStatus.COMPLETED });

      // 2. Crear cada producto con sus imágenes y asociarlo al lote/usuario
      const products = await Promise.all(
        createLoteDto.products.map(async (productDto, productIndex) =>
          productRepository.create({
            ...productDto,
            imageUrls: await this.normalizeImageUrls(productDto.images ?? [], productIndex),
            user,
            lote,
          }),
        ),
      );

      await productRepository.save(products);
      await queryRunner.commitTransaction();

      // 3. Retornar lote con sus productos
      return this.loteRepository.findOne({
        where: { id: lote.id },
        relations: ['products'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: FindAllLoteQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.loteRepository
      .createQueryBuilder('lote')
      .leftJoinAndSelect('lote.products', 'product')
      .leftJoinAndSelect('lote.purchaseOrder', 'purchaseOrder')
      .leftJoin('lote.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .loadRelationIdAndMap('lote.purchaseOrderId', 'lote.purchaseOrder')
      .orderBy('lote.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.userId) {
      queryBuilder.andWhere('user.id = :userId', { userId: query.userId });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  findOne(id: string) {
    return this.loteRepository.findOne({ where: { id }, relations: ['products',] });
  }

  async update(id: string, updateLoteDto: UpdateLoteDto) {
    const lote = await this.loteRepository.findOne({
      where: { id },
      relations: ['products', 'user'],
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }


    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepository = queryRunner.manager.getRepository(Product);

      const noProducts = !updateLoteDto.products || updateLoteDto.products.length === 0;

      if (noProducts) {
        const existingProducts = lote.products ?? [];
        if (existingProducts.length > 0) {
          await productRepository.remove(existingProducts);
        }
      } else {
        const incomingProducts = updateLoteDto.products!;
        const existingProducts = lote.products ?? [];

        const incomingIds = new Set(
          incomingProducts.filter((p) => p.id).map((p) => p.id!),
        );

        // Eliminar productos que ya no están en el DTO
        const toDelete = existingProducts.filter((p) => !incomingIds.has(p.id));
        if (toDelete.length > 0) {
          await productRepository.remove(toDelete);
        }

        await Promise.all(
          incomingProducts.map(async (productDto, index) => {
            const { id: productId, images, ...fields } = productDto;

            if (productId) {
              const existing = existingProducts.find((p) => p.id === productId);
              if (!existing) {
                throw new NotFoundException(`Producto con ID ${productId} no encontrado en este lote`);
              }

              const imageUrls = images?.length
                ? await this.normalizeImageUrls(images, index)
                : existing.imageUrls;

              await productRepository.update(productId, { ...fields, imageUrls });
            } else {
              const newProduct = productRepository.create({
                ...fields,
                imageUrls: await this.normalizeImageUrls(images ?? [], index),
                lote,
                user: lote.user,
              });
              await productRepository.save(newProduct);
            }
          }),
        );
      }

      await queryRunner.commitTransaction();

      return this.loteRepository.findOne({
        where: { id },
        relations: ['products'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, status: LoteStatus) {
    const lote = await this.loteRepository.findOne({ where: { id } });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }

    if (lote.status === LoteStatus.COMPLETED) {
      throw new BadRequestException(`No se puede actualizar el estado de un lote completado`);
    }

    await this.loteRepository.update(id, { status });

    return this.loteRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    const lote = await this.findOne(id);

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }
    return this.loteRepository.remove(lote);
  }

  private async normalizeImageUrls(images: string[], productIndex: number): Promise<string[]> {
    if (images.length === 0) {
      return [];
    }

    const normalizedImages = [...images];
    const base64Images: { value: string; originalIndex: number }[] = [];

    images.forEach((imageData, imageIndex) => {
      if (HTTP_IMAGE_URL_REGEX.test(imageData)) {
        normalizedImages[imageIndex] = this.extractPathFromHttpUrl(imageData, productIndex, imageIndex);
        return;
      }

      base64Images.push({ value: imageData, originalIndex: imageIndex });
    });

    if (base64Images.length === 0) {
      return normalizedImages;
    }

    const savedBase64ImageUrls = await this.saveBase64Images(
      base64Images.map((image) => image.value),
      productIndex,
    );

    savedBase64ImageUrls.forEach((savedUrl, index) => {
      normalizedImages[base64Images[index].originalIndex] = savedUrl;
    });

    return normalizedImages;
  }

  private extractPathFromHttpUrl(url: string, productIndex: number, imageIndex: number): string {
    try {
      const parsedUrl = new URL(url);
      const pathWithoutLeadingSlash = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`.replace(/^\/+/, '');
      return pathWithoutLeadingSlash;
    } catch {
      throw new BadRequestException(
        `URL inválida para la imagen ${imageIndex + 1} del producto ${productIndex + 1}`,
      );
    }
  }

  private async saveBase64Images(images: string[], productIndex: number): Promise<string[]> {
    if (images.length === 0) {
      return [];
    }

    const relativePath = 'public/images/products';
    const targetDir = join(process.cwd(), relativePath);
    await mkdir(targetDir, { recursive: true });

    return Promise.all(
      images.map(async (imageData, imageIndex) => {
        const parsedImage = BASE64_IMAGE_REGEX.exec(imageData);

        if (!parsedImage) {
          throw new BadRequestException(
            `Formato base64 inválido para la imagen ${imageIndex + 1} del producto ${productIndex + 1}`,
          );
        }

        const mimeType = parsedImage[1];
        const base64Payload = parsedImage[2];
        const extension = MIME_TYPE_TO_EXTENSION[mimeType];

        if (!extension) {
          throw new BadRequestException(
            `MIME type no permitido para la imagen ${imageIndex + 1} del producto ${productIndex + 1}`,
          );
        }

        const fileName = `product-${Date.now()}-${productIndex}-${imageIndex}-${Math.round(Math.random() * 1e9)}.${extension}`;
        const fullPath = join(targetDir, fileName);

        await writeFile(fullPath, Buffer.from(base64Payload, 'base64'));
        return relativePath.replace('public/', '') + '/' + fileName;
      }),
    );
  }
}
