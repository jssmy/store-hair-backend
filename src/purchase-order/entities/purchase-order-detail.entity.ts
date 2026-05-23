import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PurchaseOrder } from "./purchase-order.entity";

@Entity('purchase_order_details')
export class PurchaseOrderDetail {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50, type: 'varchar' })
    color!: string;

    @Column({ length: 50, type: 'varchar' })
    type!: string;


    @Column({ type: 'decimal', precision: 10, scale: 2 })
    length!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    weight!: number;
    
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.details)
    purchaseOrder!: PurchaseOrder;

    @CreateDateColumn()
    createdAt!: Date;

}