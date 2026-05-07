import { UserEntity } from "src/auth/infrastructure/user.entity";
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PurchaseOrder } from "src/purchase-order/entities/purchase-order.entity";
import { LoteStatus } from "../enums/lote-status.enum";

@Entity('lotes')
export class Lote {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToMany(() => Product, (product) => product.lote)
    products!: Product[];

    @ManyToOne(() => UserEntity, (user) => user.lotes)
    user!: UserEntity;

    @JoinColumn({ name: 'purchaseOrderId' })
    @OneToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.lote)
    purchaseOrder!: PurchaseOrder;

    @Column({ type: 'enum', enum: LoteStatus, default: LoteStatus.PENDING })
    status!: LoteStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}
