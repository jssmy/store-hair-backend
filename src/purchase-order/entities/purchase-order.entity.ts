import { UserEntity } from "src/auth/infrastructure/user.entity";
import { Supplier } from "src/supplier/entities/supplier.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VirtualColumn } from "typeorm";
import { PurchaseOrderDetail } from "./purchase-order-detail.entity";
import { PurchaseOrderStatus } from "../enums/purchase-order-status.enum";
import { Lote } from "src/lote/entities/lote.entity";

@Entity('purchase_orders')
export class PurchaseOrder {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.PENDING})
    status!: PurchaseOrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    tc_usd!: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    tc_converted_currency!: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    tc_converted_value!: number;

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

    @OneToOne(() => Lote, (lote) => lote.purchaseOrder)
    lote!: Lote;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    canceledAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    approvedAt!: Date;

    toJSON() {
        const totalCop = (this.details ?? []).reduce((sum, d) => sum + Number(d.price), 0);
        const usdTotal = this.tc_usd
            ? +(totalCop / Number(this.tc_usd)).toFixed(2)
            : null;
        const convertedTotal = usdTotal !== null && this.tc_converted_value
            ? +(usdTotal * Number(this.tc_converted_value)).toFixed(2)
            : null;

        return {
            ...this,
            total_cop: +totalCop.toFixed(2),
            usd_total: usdTotal,
            converted_total: convertedTotal,
        };
    }

}
