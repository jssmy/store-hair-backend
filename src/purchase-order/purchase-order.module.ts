import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderPdfService } from './purchase-order-pdf.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderDetail } from './entities/purchase-order-detail.entity';

@Module({
  controllers: [PurchaseOrderController],
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderDetail])],
  providers: [PurchaseOrderService, PurchaseOrderPdfService],
})
export class PurchaseOrderModule {}
