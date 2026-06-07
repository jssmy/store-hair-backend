import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SalePayment } from './entities/sale-payment.entity';
import { SalePaymentType } from './enums/sale-payment-type.enum';

@Injectable()
export class SalePaymentSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SalePaymentSeeder.name);

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SalePayment)
    private readonly salePaymentRepository: Repository<SalePayment>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.payments', 'payments')
      .where('payments.id IS NULL')
      .andWhere('(sale.cashAmount > 0 OR sale.transferAmount > 0)')
      .getMany();

    if (sales.length === 0) return;

    const payments: Partial<SalePayment>[] = [];

    for (const sale of sales) {
      if (Number(sale.cashAmount) > 0) {
        payments.push({ amount: sale.cashAmount, type: SalePaymentType.CASH, sale });
      }
      if (Number(sale.transferAmount) > 0) {
        payments.push({ amount: sale.transferAmount, type: SalePaymentType.TRANSFER, sale });
      }
    }

    await this.salePaymentRepository.save(payments);
    this.logger.log(`Pagos generados para ${sales.length} venta(s) existente(s)`);
  }
}
