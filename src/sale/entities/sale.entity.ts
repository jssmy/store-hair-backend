import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from 'src/auth/infrastructure/user.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { SalePaymentMethod } from '../enums/sale-payment-method.enum';
import { SaleDetail } from './sale-detail.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
