import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/infrastructure/user.entity';
import { LoteStatus } from './enums/lote-status.enum';
import { AuthUser } from 'src/auth/domain/auth-user.entity';
import { Product } from 'src/product/entities/product.entity';
import { FindAllLoteQueryDto } from './dto/find-all-lote-query.dto';
import { PurchaseOrder } from 'src/purchase-order/entities/purchase-order.entity';
import { PurchaseOrderStatus } from 'src/purchase-order/enums/purchase-order-status.enum';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class LoteService {

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    private readonly productService: ProductService,
  ) { }

  async create(createLoteDto: CreateLoteDto, authUser: AuthUser) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loteRepository = queryRunner.manager.getRepository(Lote);
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

      const lote = await loteRepository.save(
        loteRepository.create({ user, purchaseOrder }),
      );

      await purchaseOrderRepository.update(purchaseOrder.id, { status: PurchaseOrderStatus.COMPLETED });

      await queryRunner.commitTransaction();

      return lote;
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
    const search = query.search?.trim();

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

    if (query.status) {
      queryBuilder.andWhere('lote.status = :status', { status: query.status });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('CAST(lote.id AS TEXT) ILIKE :search', { search: `%${search}%` })
            .orWhere('CAST(purchaseOrder.id AS TEXT) ILIKE :search', { search: `%${search}%` })
            .orWhere('product.name ILIKE :search', { search: `%${search}%` })
            .orWhere('product.type ILIKE :search', { search: `%${search}%` })
            .orWhere('product.color ILIKE :search', { search: `%${search}%` })
            .orWhere('user.name ILIKE :search', { search: `%${search}%` });
        }),
      );
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

  findOne(id: number) {
    return this.loteRepository.findOne({ where: { id }, relations: ['products'] });
  }

  async updateStatus(id: number, status: LoteStatus) {
    const lote = await this.loteRepository.findOne({ where: { id }, relations: ['products'] });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }

    if (lote.status === LoteStatus.COMPLETED) {
      throw new BadRequestException(`No se puede actualizar el estado de un lote completado`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loteRepository = queryRunner.manager.getRepository(Lote);
      await loteRepository.update(id, { status });

      if (status === LoteStatus.COMPLETED && lote.products?.length) {
        const productIds = lote.products.map((p) => p.id);
        const productRepository = queryRunner.manager.getRepository(Product);
        await productRepository.update({ id: In(productIds) }, { active: true });
      }

      await queryRunner.commitTransaction();

      return this.loteRepository.findOne({ where: { id }, relations: ['products'] });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const lote = await this.findOne(id);

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }
    return this.loteRepository.remove(lote);
  }
}
