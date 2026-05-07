import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImagesInterceptor } from './infrastructure/product-images-upload.config';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseInterceptors(ProductImagesInterceptor())
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear producto', description: 'Crea un nuevo producto. Las imágenes se envían como archivos multipart o en base64.' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(
    @UploadedFiles() imagenes: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    console.log(imagenes);
    return this.productService.create(createProductDto, imagenes.map(file => file.filename));
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos', description: 'Retorna todos los productos registrados.' })
  @ApiResponse({ status: 200, description: 'Lista de productos.' })
  findAll() {
    return this.productService.findAll();
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
  @ApiOperation({ summary: 'Actualizar producto', description: 'Actualiza los campos de un producto existente.' })
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
