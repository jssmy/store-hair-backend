import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthUser } from '../auth/domain/auth-user.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { FindAllPurchaseOrderQueryDto } from './dto/find-all-purchase-order-query.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderDetail } from './entities/purchase-order-detail.entity';
import { PurchaseOrderStatus } from './enums/purchase-order-status.enum';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, authUser: AuthUser) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseOrderRepository = queryRunner.manager.getRepository(PurchaseOrder);
      const purchaseOrderDetailRepository = queryRunner.manager.getRepository(PurchaseOrderDetail);

      const supplier = await queryRunner.manager
        .createQueryBuilder()
        .select('supplier.id', 'id')
        .from('suppliers', 'supplier')
        .where('supplier.id = :supplierId', {
          supplierId: createPurchaseOrderDto.supplierId,
        })
        .getRawOne<{ id: number }>();

      if (!supplier) {
        throw new NotFoundException(
          `Proveedor con ID ${createPurchaseOrderDto.supplierId} no encontrado`,
        );
      }

      // 1. Guardar cabecera primero para obtener ID
      const purchaseOrder = await purchaseOrderRepository.save(
        purchaseOrderRepository.create({
          user: { id: authUser.id } as PurchaseOrder['user'],
          supplier: { id: supplier.id } as PurchaseOrder['supplier'],
        }),
      );

      // 2. Crear detalles y asociarlos a la orden
      const details = (createPurchaseOrderDto.details ?? []).map((detailDto) =>
        purchaseOrderDetailRepository.create({
          ...detailDto,
          purchaseOrder,
        }),
      );

      if (details.length > 0) {
        await purchaseOrderDetailRepository.save(details);
      }

      await queryRunner.commitTransaction();

      // 3. Retornar orden completa con su detalle y proveedor
      return this.purchaseOrderRepository.findOne({
        where: { id: purchaseOrder.id },
        relations: ['details', 'supplier'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: FindAllPurchaseOrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.purchaseOrderRepository
      .createQueryBuilder('purchaseOrder')
      .leftJoinAndSelect('purchaseOrder.details', 'detail')
      .leftJoinAndSelect('purchaseOrder.supplier', 'supplier')
      .leftJoin('purchaseOrder.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .orderBy('purchaseOrder.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.supplierId) {
      queryBuilder.andWhere('supplier.id = :supplierId', {
        supplierId: query.supplierId,
      });
    }

    if (query.userId) {
      queryBuilder.andWhere('user.id = :userId', {
        userId: query.userId,
      });
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

  async findOne(id: number) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['details', 'supplier'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    return purchaseOrder;
  }

  async update(id: number, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['details', 'supplier'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseOrderRepository = queryRunner.manager.getRepository(PurchaseOrder);
      const purchaseOrderDetailRepository = queryRunner.manager.getRepository(PurchaseOrderDetail);

      await purchaseOrderRepository.save(purchaseOrder);

      if (updatePurchaseOrderDto.details !== undefined) {
        const existingDetails = purchaseOrder.details ?? [];

        if (existingDetails.length > 0) {
          await purchaseOrderDetailRepository.remove(existingDetails);
        }

        const newDetails = updatePurchaseOrderDto.details.map((detailDto) =>
          purchaseOrderDetailRepository.create({
            ...detailDto,
            purchaseOrder,
          }),
        );

        if (newDetails.length > 0) {
          await purchaseOrderDetailRepository.save(newDetails);
        }
      }

      await queryRunner.commitTransaction();

      return this.purchaseOrderRepository.findOne({
        where: { id },
        relations: ['details', 'supplier'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, dto: UpdatePurchaseOrderStatusDto) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });

    if (!purchaseOrder) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING) {
      throw new BadRequestException(
        `No se puede cambiar el estado de una orden en estado '${purchaseOrder.status}'. Solo se permite actualizar órdenes en estado 'pending'.`,
      );
    }

    purchaseOrder.status = dto.status;

    if (dto.status === PurchaseOrderStatus.APPROVED) {
      purchaseOrder.approvedAt = new Date();
    } else if (dto.status === PurchaseOrderStatus.CANCELED) {
      purchaseOrder.canceledAt = new Date();
    } else if (dto.status === PurchaseOrderStatus.COMPLETED) {
      purchaseOrder.completedAt = new Date();
    }

    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  async remove(id: number) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['details'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchaseOrderRepository = queryRunner.manager.getRepository(PurchaseOrder);
      const purchaseOrderDetailRepository = queryRunner.manager.getRepository(PurchaseOrderDetail);

      if (purchaseOrder.details?.length) {
        await purchaseOrderDetailRepository.remove(purchaseOrder.details);
      }

      await purchaseOrderRepository.remove(purchaseOrder);
      await queryRunner.commitTransaction();

      return purchaseOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
