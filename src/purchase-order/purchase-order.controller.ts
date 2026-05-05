import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { FindAllPurchaseOrderQueryDto } from './dto/find-all-purchase-order-query.dto';
import { CurrentUser } from '../auth/infrastructure/current-user.decorator';
import { AuthUser } from '../auth/domain/auth-user.entity';
import { JwtAuthGuard } from '../auth/infrastructure/jwt-auth.guard';

@ApiTags('Purchase Orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Crear orden de compra', description: 'Crea una nueva orden de compra con proveedor y detalle de productos. Asociada al usuario autenticado.' })
  @ApiResponse({ status: 201, description: 'Orden de compra creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchaseOrderService.create(createPurchaseOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes de compra', description: 'Retorna la lista paginada de órdenes. Se puede filtrar por supplierId y userId.' })
  @ApiResponse({ status: 200, description: 'Lista paginada de órdenes de compra.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: FindAllPurchaseOrderQueryDto) {
    return this.purchaseOrderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden de compra por ID', description: 'Retorna una orden de compra específica por su ID numérico.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la orden de compra', example: 1 })
  @ApiResponse({ status: 200, description: 'Orden de compra encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar orden de compra', description: 'Actualiza los datos de una orden de compra existente.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la orden de compra', example: 1 })
  @ApiResponse({ status: 200, description: 'Orden de compra actualizada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada.' })
  update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.purchaseOrderService.update(+id, updatePurchaseOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar orden de compra', description: 'Elimina una orden de compra por su ID numérico.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la orden de compra', example: 1 })
  @ApiResponse({ status: 200, description: 'Orden de compra eliminada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada.' })
  remove(@Param('id') id: string) {
    return this.purchaseOrderService.remove(+id);
  }
}
