import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { FindAllProductQueryDto } from './dto/find-all-product-query.dto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Lote } from 'src/lote/entities/lote.entity';
import { UserEntity } from 'src/auth/infrastructure/user.entity';
import { AuthUser } from 'src/auth/domain/auth-user.entity';

const BASE64_IMAGE_REGEX = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/]+=*)$/;
const HTTP_IMAGE_URL_REGEX = /^https?:\/\/\S+$/i;
const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
  ) { }

  async create(createProductDto: CreateProductDto, authUser: AuthUser) {
    const { loteId, images, ...fields } = createProductDto;

    const lote = await this.loteRepository.findOne({ where: { id: loteId } });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${loteId} no encontrado`);
    }

    const imageUrls = await this.normalizeImageUrls(images ?? [], 0);
    const user = { id: authUser.id } as UserEntity;

    return this.productRepository.save(
      this.productRepository.create({ ...fields, imageUrls, lote, user }),
    );
  }

  async findAll(query: FindAllProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.active !== undefined) {
      queryBuilder.andWhere('product.active = :active', { active: query.active });
    }

    if (query.type !== undefined) {
      queryBuilder.andWhere('product.type = :type', { type: query.type });
    }

    if (query.color !== undefined) {
      queryBuilder.andWhere('product.color = :color', { color: query.color });
    }

    if (query.search) {
      const poPattern = /^PO-(\d{4})-(\d+)$/i;
      const paddedIdPattern = /^0(\d+)$/;

      const poMatch = query.search.match(poPattern);
      const paddedMatch = !poMatch && query.search.match(paddedIdPattern);

      if (poMatch) {
        const year = parseInt(poMatch[1], 10);
        const id   = parseInt(poMatch[2], 10);
        queryBuilder
          .andWhere('product.id = :id', { id })
          .andWhere('EXTRACT(YEAR FROM product.createdAt) = :year', { year });
      } else if (paddedMatch) {
        const id = parseInt(paddedMatch[1], 10);
        queryBuilder.andWhere('product.id = :id', { id });
      } else {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.type ILIKE :search OR product.color ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: number) {
    return this.productRepository.findOneBy({ id });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const { images, ...fields } = updateProductDto;

    const imageUrls = images?.length
      ? await this.normalizeImageUrls(images, 0)
      : product.imageUrls;

    return this.productRepository.update(id, { ...fields, imageUrls });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.productRepository.delete(id);
  }

  async normalizeImageUrls(images: string[], productIndex: number): Promise<string[]> {
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
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`.replace(/^\/+/, '');
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
