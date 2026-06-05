import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Product } from 'src/product/entities/product.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FindAllSaleQueryDto } from './dto/find-all-sale-query.dto';
import { SalePaymentMethod } from './enums/sale-payment-method.enum';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateSaleDto, userId: string) {
    const customer = await this.customerRepository.findOneBy({ id: dto.customerId });
    if (!customer) throw new NotFoundException('El cliente no existe');

    const productIds = dto.details.map((d) => d.productId);
    const products = await this.productRepository.findBy({ id: In(productIds) });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const detail of dto.details) {
      if (!productMap.has(detail.productId)) {
        throw new NotFoundException(`El producto con ID ${detail.productId} no existe`);
      }
    }

    const totalAmount = dto.details.reduce((sum, d) => sum + Number(d.salePrice), 0);
    const paidAmount = Number(dto.cashAmount) + Number(dto.transferAmount);

    if (dto.paymentMethod === SalePaymentMethod.CASH) {
      if (Math.abs(paidAmount - totalAmount) > 0.01) {
        throw new BadRequestException(
          'Para pago contado, el monto pagado (efectivo + transferencia) debe ser igual al total de la venta',
        );
      }
    }

    if (dto.paymentMethod === SalePaymentMethod.CREDIT && paidAmount > totalAmount + 0.01) {
      throw new BadRequestException('El abono inicial no puede superar el total de la venta');
    }

    const sale = this.saleRepository.create({
      paymentMethod: dto.paymentMethod,
      totalAmount,
      cashAmount: dto.cashAmount,
      transferAmount: dto.transferAmount,
      notes: dto.notes ?? null,
      customer: { id: dto.customerId } as Customer,
      user: { id: userId } as any,
      details: dto.details.map((d) => ({
        salePrice: d.salePrice,
        product: { id: d.productId } as Product,
      })),
    });

    const saved = await this.saleRepository.save(sale);

    await this.productRepository.update(productIds, { active: false });

    return this.findOne(saved.id);
  }

  async findAll(query: FindAllSaleQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.customer', 'customer')
      .addSelect(['customer.id', 'customer.names', 'customer.phone', 'customer.dni'])
      .leftJoin('sale.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email'])
      .leftJoinAndSelect('sale.details', 'details')
      .leftJoin('details.product', 'product')
      .addSelect([
        'product.id',
        'product.name',
        'product.price',
        'product.type',
        'product.color',
        'product.length',
        'product.weight',
        'product.createdAt',
          
      ]).orderBy('sale.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.paymentMethod) {
      qb.andWhere('sale.paymentMethod = :paymentMethod', { paymentMethod: query.paymentMethod });
    }

    if (query.customerId) {
      qb.andWhere('customer.id = :customerId', { customerId: query.customerId });
    }


    if (query.search) {
      const term = query.search.trim();
      const fullMatch = term.match(/^VT-(\d{4})-(\d+)$/i);
      const idOnlyMatch = term.match(/^(\d+)$/);

      if (fullMatch) {
        const year = parseInt(fullMatch[1], 10);
        const id = parseInt(fullMatch[2], 10);
        qb.andWhere('EXTRACT(YEAR FROM sale.createdAt) = :year AND sale.id = :id', { year, id });
      } else if (idOnlyMatch) {
        qb.andWhere('sale.id = :id', { id: parseInt(idOnlyMatch[1], 10) });
      }
    }

    const [data, total] = await qb.getManyAndCount();

    data.forEach((sale) => {
      sale.details?.forEach((detail) => {
        const product = detail.product;
        if (!product || !product.createdAt || !product.id) return;

        const year = new Date(product.createdAt).getFullYear();
        product.po = `PO-${year}-${product.id}`;
      });
    });

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

  async findOne(id: number) {
    const sale = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.customer', 'customer')
      .addSelect(['customer.id', 'customer.names', 'customer.phone', 'customer.dni'])
      .leftJoin('sale.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email'])
      .leftJoinAndSelect('sale.details', 'details')
      .leftJoin('details.product', 'product')
      .addSelect([
        'product.id',
        'product.name',
        'product.price',
        'product.type',
        'product.color',
        'product.length',
        'product.weight',
        'product.createdAt',
      ])
      .where('sale.id = :id', { id })
      .getOne();

    if (!sale) throw new NotFoundException('La venta no existe');
    return sale;
  }
}
