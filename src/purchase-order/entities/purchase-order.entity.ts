import { UserEntity } from "src/auth/infrastructure/user.entity";
import { Supplier } from "src/supplier/entities/supplier.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, VirtualColumn } from "typeorm";
import { PurchaseOrderDetail } from "./purchase-order-detail.entity";
import { PurchaseOrderStatus } from "../enums/purchase-order-status.enum";

@Entity('purchase_orders')
export class PurchaseOrder {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.PENDING})
    status!: PurchaseOrderStatus;

    @ManyToOne(() => UserEntity, (user) => user.purchaseOrders)
    user!: UserEntity;

    @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders)
    supplier!: Supplier;

    @OneToMany(() => PurchaseOrderDetail, (detail) => detail.purchaseOrder)
    details!: PurchaseOrderDetail[];

    @VirtualColumn({
        query: (alias) =>
            `CONCAT('OC-', EXTRACT(YEAR FROM ${alias}."createdAt"), '-', ${alias}.id)`
    })
    oc!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
