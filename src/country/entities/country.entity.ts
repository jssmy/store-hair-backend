import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('countries')
export class Country {
    @PrimaryColumn({ type: 'varchar', length: 3 })
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 6 })
    prefix!: string;

    @Column({ default: true })
    active!: boolean;

    @OneToMany(() => Supplier, (supplier) => supplier.country)
    suppliers!: Supplier[];
}
