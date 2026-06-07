import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/jwt-auth.guard';
import { CurrentUser } from '../auth/infrastructure/current-user.decorator';
import { AuthUser } from '../auth/domain/auth-user.entity';
import { SaleService } from './sale.service';
import { SalePdfService } from './sale-pdf.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateSalePaymentDto } from './dto/create-sale-payment.dto';
import { FindAllSaleQueryDto } from './dto/find-all-sale-query.dto';

@ApiTags('Sales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('sale')
export class SaleController {
  constructor(
    private readonly saleService: SaleService,
    private readonly salePdfService: SalePdfService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar venta', description: 'Crea una nueva venta asociada al usuario autenticado y al cliente indicado.' })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o montos de pago incorrectos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cliente o producto no encontrado.' })
  create(@Body() dto: CreateSaleDto, @CurrentUser() user: AuthUser) {
    return this.saleService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas', description: 'Retorna la lista paginada de ventas con sus detalles.' })
  @ApiResponse({ status: 200, description: 'Lista paginada de ventas.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: FindAllSaleQueryDto) {
    return this.saleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener venta por ID', description: 'Retorna una venta con su detalle de productos y datos de pago.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la venta', example: 1 })
  @ApiResponse({ status: 200, description: 'Venta encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saleService.findOne(id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Registrar pago', description: 'Agrega un pago a una venta existente. El monto no puede superar el saldo pendiente.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la venta', example: 1 })
  @ApiResponse({ status: 201, description: 'Pago registrado.' })
  @ApiResponse({ status: 400, description: 'Monto inválido o excede el saldo pendiente.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  addPayment(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSalePaymentDto) {
    return this.saleService.addPayment(id, dto);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Descargar boleta PDF', description: 'Genera y devuelve la boleta de venta en formato PDF.' })
  @ApiParam({ name: 'id', description: 'ID numérico de la venta', example: 1 })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  async downloadPdf(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    const buffer = await this.salePdfService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="boleta-VT-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
