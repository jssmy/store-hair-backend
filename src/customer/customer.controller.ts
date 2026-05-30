import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/jwt-auth.guard';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { FindAllCustomerQueryDto } from './dto/find-all-customer-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cliente', description: 'Registra un nuevo cliente.' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 409, description: 'El DNI ya está registrado.' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes', description: 'Retorna la lista paginada de clientes. Filtra por nombre, teléfono o DNI con el parámetro search.' })
  @ApiResponse({ status: 200, description: 'Lista paginada de clientes.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: FindAllCustomerQueryDto) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID', description: 'Retorna un cliente específico por su ID numérico.' })
  @ApiParam({ name: 'id', description: 'ID numérico del cliente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.findOne(id);
  }

  @Patch(':dni')
  @ApiOperation({ summary: 'Actualizar cliente', description: 'Actualiza nombre y teléfono del cliente identificado por DNI.' })
  @ApiParam({ name: 'dni', description: 'DNI del cliente', example: '12345678' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  update(@Param('dni') dni: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(dni, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar cliente', description: 'Desactiva un cliente por su ID (soft delete).' })
  @ApiParam({ name: 'id', description: 'ID numérico del cliente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cliente desactivado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.remove(id);
  }
}
