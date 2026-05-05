import { UserEntity } from "src/auth/infrastructure/user.entity";
import { Country } from "src/country/entities/country.entity";
import { PurchaseOrder } from "src/purchase-order/entities/purchase-order.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SupplierType } from "../enums/supplier-type.enum";

@Entity('suppliers')
export class Supplier {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'enum', enum: SupplierType, default: SupplierType.NATURAL })
    type!: SupplierType;

    @Column({ type: 'varchar', length: 155, nullable: true })
    fullName!: string | null;

    @Column({ type: 'varchar', length: 155, nullable: true })
    businessName!: string | null;

    @Column({ unique: true, type: 'varchar', length: 14, nullable: true })
    dni!: string | null;

    @Column({ unique: true, type: 'varchar', length: 14, nullable: true })
    ruc!: string | null;

    @Column({ type: 'varchar', length: 155, nullable: true })
    contactFullName!: string | null;

    @Column({ type: 'varchar', length: 14, nullable: true })
    contactDni!: string | null;

    @Column({ type: 'varchar', length: 15 })
    phone!: string;

    @Column({ type: 'varchar', length: 155 })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    address!: string;

    @Column({ default: true })
    active!: boolean;

    @Column({ type: 'varchar', length: 3, default: 'PE' })
    countryId!: string;

    @ManyToOne(() => Country, (country) => country.suppliers, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'countryId' })
    country!: Country;

    @ManyToOne(() => UserEntity, (user) => user.suppliers)
    user!: UserEntity;

    @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.supplier)
    purchaseOrders!: PurchaseOrder[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}
