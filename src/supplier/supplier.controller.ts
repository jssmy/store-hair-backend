import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/infrastructure/jwt-auth.guard';
import { FindAllSupplierQueryDto } from 'src/supplier/dto/find-all-supplier-query.dto';

@ApiTags('Suppliers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: 'Crear proveedor', description: 'Registra un nuevo proveedor (persona natural o jurídica).' })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar proveedores', description: 'Retorna la lista paginada de proveedores.' })
  @ApiResponse({ status: 200, description: 'Lista paginada de proveedores.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: FindAllSupplierQueryDto) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID', description: 'Retorna un proveedor específico por su ID numérico.' })
  @ApiParam({ name: 'id', description: 'ID numérico del proveedor', example: 1 })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proveedor', description: 'Actualiza los datos de un proveedor existente.' })
  @ApiParam({ name: 'id', description: 'ID numérico del proveedor', example: 1 })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proveedor', description: 'Elimina un proveedor por su ID numérico.' })
  @ApiParam({ name: 'id', description: 'ID numérico del proveedor', example: 1 })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
