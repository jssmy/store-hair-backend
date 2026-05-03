import { UserEntity } from "src/auth/infrastructure/user.entity";
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LoteStatus } from "../enums/lote-status.enum";

@Entity('lotes')
export class Lote {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToMany(() => Product, (product) => product.lote)
    products!: Product[];

    @ManyToOne(() => UserEntity, (user) => user.lotes)
    user!: UserEntity;

    @Column({ type: 'enum', enum: LoteStatus, default: LoteStatus.PENDING })
    status!: LoteStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}
