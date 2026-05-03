import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductStatus } from "../enums/product-status.enum";
import { UserEntity } from "src/auth/infrastructure/user.entity";
import { Lote } from "src/lote/entities/lote.entity";


@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id!: string;


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

    @Column({ default: true })
    active!: boolean;

    @Column({ type: 'json', nullable: true })
    imageUrls!: string[];

    @ManyToOne(() => UserEntity, (user) => user.products)
    user!: UserEntity;

    @ManyToOne(() => Lote, (lote) => lote.products)
    lote!: Lote;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

}
