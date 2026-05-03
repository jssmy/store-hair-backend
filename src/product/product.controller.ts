import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImagesInterceptor } from './infrastructure/product-images-upload.config';


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseInterceptors(ProductImagesInterceptor())
  @Post()
  create(
    @UploadedFiles() imagenes: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto
  ) {
    console.log(imagenes);
    return this.productService.create(createProductDto, imagenes.map(file => file.filename));
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
