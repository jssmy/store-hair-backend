import { Module } from '@nestjs/common';
import { LoteService } from './lote.service';
import { LoteController } from './lote.controller';
import { Lote } from './entities/lote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/infrastructure/user.entity';
import { Product } from 'src/product/entities/product.entity';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lote, UserEntity, Product]), ProductModule],
  controllers: [LoteController],
  providers: [LoteService],
})
export class LoteModule {}
