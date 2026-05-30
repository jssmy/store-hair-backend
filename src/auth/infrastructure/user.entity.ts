import { Lote } from 'src/lote/entities/lote.entity';
import { Product } from 'src/product/entities/product.entity';
import { PurchaseOrder } from 'src/purchase-order/entities/purchase-order.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { UserRole } from 'src/user/enums/user-role.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  role!: UserRole;

  @OneToMany(() => Product, (product) => product.user)
  products!: Product[];


  @OneToMany(() => Lote, (lote) => lote.user)
  lotes!: Lote[];

  @OneToMany(() => Supplier, (supplier) => supplier.user)
  suppliers!: Supplier[];

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.user)
  purchaseOrders!: PurchaseOrder[];

  @OneToMany(() => Sale, (sale) => sale.user)
  sales!: Sale[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

}
