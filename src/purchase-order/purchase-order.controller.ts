import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { FindAllPurchaseOrderQueryDto } from './dto/find-all-purchase-order-query.dto';
import { CurrentUser } from '../auth/infrastructure/current-user.decorator';
import { AuthUser } from '../auth/domain/auth-user.entity';
import { JwtAuthGuard } from '../auth/infrastructure/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  create(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchaseOrderService.create(createPurchaseOrderDto, user);
  }

  @Get()
  findAll(@Query() query: FindAllPurchaseOrderQueryDto) {
    return this.purchaseOrderService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.purchaseOrderService.update(+id, updatePurchaseOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrderService.remove(+id);
  }
}
