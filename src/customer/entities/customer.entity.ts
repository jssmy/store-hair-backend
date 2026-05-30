import { Sale } from 'src/sale/entities/sale.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 155 })
  names!: string;

  @Column({ type: 'varchar', length: 15 })
  phone!: string;

  @Column({ unique: true, type: 'varchar', length: 12, nullable: true })
  dni!: string | null;

  @OneToMany(() => Sale, (sale) => sale.customer)
  sales!: Sale[];

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
