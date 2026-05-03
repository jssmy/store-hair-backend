import { UserEntity } from "src/auth/infrastructure/user.entity";
import { PurchaseOrder } from "src/purchase-order/entities/purchase-order.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('suppliers')
export class Supplier {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 155 })
    name!: string;

    @Column({ unique: true, type: 'varchar', length: 14, nullable: false })
    dni!: string;

    @Column({ length: 15 })
    phone!: string;

    @Column({ length: 155 })
    email!: string;

    @Column({ length: 255 })
    address!: string;

    @Column({ default: true })
    active!: boolean;

    @ManyToOne(() => UserEntity, (user) => user.suppliers)
    user!: UserEntity;

    @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.supplier)
    purchaseOrders!: PurchaseOrder[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}
