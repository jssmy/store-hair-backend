import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { Product } from 'src/product/entities/product.entity';
import { Customer } from 'src/customer/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleDetail, Product, Customer]), AuthModule],
  controllers: [SaleController],
  providers: [SaleService],
})
export class SaleModule {}
