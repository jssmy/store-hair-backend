import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('suppliers')
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 155 })
    name: string;

    @Column({ unique: true, type: 'bigint' })
    dni: number;

    @Column({ length: 15 })
    phone: string;

    @Column({ length: 155 })
    email: string;

    @Column({ length: 255 })
    address: string;

    @Column({ default: true })
    active: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
