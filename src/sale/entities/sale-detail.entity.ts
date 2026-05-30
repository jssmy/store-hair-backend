import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Sale } from './sale.entity';

@Entity('sale_details')
export class SaleDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice!: number;

  @ManyToOne(() => Product, (product) => product.saleDetails)
  product!: Product;

  @ManyToOne(() => Sale, (sale) => sale.details, { onDelete: 'CASCADE' })
  sale!: Sale;
}
