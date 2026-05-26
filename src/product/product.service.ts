import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { FindAllProductQueryDto } from './dto/find-all-product-query.dto';

@Injectable()
export class ProductService {


  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>

  ) { }

  create(createProductDto: CreateProductDto, images: string[]) {
    return this.productRepository.save(this.productRepository.create({ ...createProductDto, imageUrls: images }));
  }

  async findAll(query: FindAllProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.active !== undefined) {
      queryBuilder.andWhere('product.active = :active', { active: query.active });
    }

    if (query.type !== undefined) {
      queryBuilder.andWhere('product.type = :type', { type: query.type });
    }

    if (query.color !== undefined) {
      queryBuilder.andWhere('product.color = :color', { color: query.color });
    }

    if (query.search) {
      // Patrón: PO-YYYY-ID  → e.g. "PO-2026-2"
      const poPattern = /^PO-(\d{4})-(\d+)$/i;
      // Patrón: ID con ceros a la izquierda → e.g. "0002"
      const paddedIdPattern = /^0(\d+)$/;

      const poMatch = query.search.match(poPattern);
      const paddedMatch = !poMatch && query.search.match(paddedIdPattern);

      if (poMatch) {
        const year = parseInt(poMatch[1], 10);
        const id   = parseInt(poMatch[2], 10);
        queryBuilder
          .andWhere('product.id = :id', { id })
          .andWhere('EXTRACT(YEAR FROM product.createdAt) = :year', { year });
      } else if (paddedMatch) {
        const id = parseInt(paddedMatch[1], 10);
        queryBuilder.andWhere('product.id = :id', { id });
      } else {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.type ILIKE :search OR product.color ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
