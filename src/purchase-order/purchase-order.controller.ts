import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderPdfService } from './purchase-order-pdf.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { FindAllPurchaseOrderQueryDto } from './dto/find-all-purchase-order-query.dto';
import { CurrentUser } from '../auth/infrastructure/current-user.decorator';
import { AuthUser } from '../auth/domain/auth-user.entity';
import { JwtAuthGuard } from '../auth/infrastructure/jwt-auth.guard';

@ApiTags('Purchase Orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly purchaseOrderPdfService: PurchaseOrderPdfService,
  ) {}

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

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Descargar orden de compra en PDF',
    description: 'Genera y descarga el PDF de la orden de compra con datos del proveedor, detalle de productos e información de la empresa.',
  })
  @ApiProduces('application/pdf')
  @ApiParam({ name: 'id', description: 'ID numérico de la orden de compra', example: 1 })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente.', content: { 'application/pdf': {} } })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada.' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.purchaseOrderPdfService.generatePdf(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orden-compra-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
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

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar estado de orden de compra',
    description: 'Solo permite cambiar el estado de una orden que esté en estado pendiente. Los valores permitidos son: aprobado (approved) o cancelado (canceled). No se puede modificar si ya está aprobada, cancelada o completada.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico de la orden de compra', example: 1 })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'La orden no está en estado pendiente o el estado enviado no es válido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada.' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderStatusDto) {
    return this.purchaseOrderService.updateStatus(+id, dto);
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
