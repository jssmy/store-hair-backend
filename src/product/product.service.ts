import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {


  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>

  ) { }

  create(createProductDto: CreateProductDto, images: string[]) {
    return this.productRepository.save(this.productRepository.create({ ...createProductDto, imageUrls: images }));
  }

  findAll() {
    return this.productRepository.find();
  }

  findOne(id: number) {
    return this.productRepository.findOneBy({ id });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }


    return this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.productRepository.delete(id);
  }
}
