import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductQueryDto } from './dto/find-all-product-query.dto';
import { JwtAuthGuard } from 'src/auth/infrastructure/jwt-auth.guard';
import { CurrentUser } from 'src/auth/infrastructure/current-user.decorator';
import { AuthUser } from 'src/auth/domain/auth-user.entity';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Crear producto', description: 'Crea un nuevo producto y lo asocia al lote indicado.' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productService.create(createProductDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos', description: 'Retorna la lista paginada de productos con filtros opcionales.' })
  @ApiResponse({ status: 200, description: 'Lista paginada de productos.' })
  findAll(@Query() query: FindAllProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID', description: 'Retorna un producto específico por su ID numérico.' })
  @ApiParam({ name: 'id', description: 'ID numérico del producto', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto', description: 'Actualiza los campos de un producto. Si se envían imágenes, reemplazan las existentes.' })
  @ApiParam({ name: 'id', description: 'ID numérico del producto', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto', description: 'Elimina un producto por su ID numérico.' })
  @ApiParam({ name: 'id', description: 'ID numérico del producto', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
