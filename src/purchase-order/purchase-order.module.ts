import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderPdfService } from './purchase-order-pdf.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderDetail } from './entities/purchase-order-detail.entity';
import { AppSettingsModule } from 'src/app-settings/app-settings.module';

@Module({
  controllers: [PurchaseOrderController],
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderDetail]), AppSettingsModule],
  providers: [PurchaseOrderService, PurchaseOrderPdfService],
})
export class PurchaseOrderModule {}
