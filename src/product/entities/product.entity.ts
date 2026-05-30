import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, VirtualColumn } from "typeorm";
import { ProductStatus } from "../enums/product-status.enum";
import { UserEntity } from "src/auth/infrastructure/user.entity";
import { Lote } from "src/lote/entities/lote.entity";
import { SaleDetail } from "src/sale/entities/sale-detail.entity";


@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @VirtualColumn({
            query: (alias) =>
                `CONCAT('PO-', EXTRACT(YEAR FROM ${alias}."createdAt"), '-', ${alias}.id)`
        })
        po!: string;
    


    @BeforeInsert()
    @BeforeUpdate()
    generateName() {
        this.name = `Coleta ${this.type} ${this.color} ${this.length} cm ${this.weight} g`.trim();
    }

    @Column({ length: 50, type: 'varchar' })
    type!: string;

    @Column({ length: 50, type: 'varchar' })
    color!: string;

    @Column({ length: 255, type: 'varchar' })
    name!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;


    @Column({ type: 'decimal', precision: 10, scale: 2 })
    length!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    weight!: number;

    @Column({ default: false })
    active!: boolean;

    @Column({ type: 'json', nullable: true })
    imageUrls!: string[];

    @ManyToOne(() => UserEntity, (user) => user.products)
    user!: UserEntity;

    @ManyToOne(() => Lote, (lote) => lote.products)
    lote!: Lote;

    @OneToMany(() => SaleDetail, (detail) => detail.product)
    saleDetails!: SaleDetail[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

}
