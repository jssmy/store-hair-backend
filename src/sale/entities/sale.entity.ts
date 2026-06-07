import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, VirtualColumn } from 'typeorm';
import { UserEntity } from 'src/auth/infrastructure/user.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { SalePaymentMethod } from '../enums/sale-payment-method.enum';
import { SaleDetail } from './sale-detail.entity';
import { SalePayment } from './sale-payment.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @VirtualColumn({
          query: (alias) =>
              `CONCAT('VT-', EXTRACT(YEAR FROM ${alias}."createdAt"), '-', ${alias}.id)`
      })
  vt!: string;

  @Column({ type: 'enum', enum: SalePaymentMethod })
  paymentMethod!: SalePaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cashAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  transferAmount!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes!: string | null;

  @ManyToOne(() => Customer, (customer) => customer.sales)
  customer!: Customer;

  @ManyToOne(() => UserEntity, (user) => user.sales)
  user!: UserEntity;

  @OneToMany(() => SaleDetail, (detail) => detail.sale, { cascade: true })
  details!: SaleDetail[];

  @OneToMany(() => SalePayment, (payment) => payment.sale, { cascade: true })
  payments!: SalePayment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
