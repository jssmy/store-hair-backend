import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettings {
    @PrimaryColumn()
    id!: number;

    @Column({ type: 'varchar', length: 150 })
    companyName!: string;

    @Column({ type: 'varchar', length: 200, default: '' })
    address!: string;

    @Column({ type: 'varchar', length: 30, default: '' })
    phone!: string;

    @Column({ type: 'varchar', length: 100, default: '' })
    email!: string;

    @Column({ type: 'varchar', length: 20, default: '' })
    taxId!: string;
}
