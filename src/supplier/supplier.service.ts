import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindAllSupplierQueryDto } from 'src/supplier/dto/find-all-supplier-query.dto';

@Injectable()
export class SupplierService {

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

  ) { }

  async create(createSupplierDto: CreateSupplierDto) {

    const user = await this.supplierRepository.findOneBy({ dni: createSupplierDto.dni });
    if (user) {
      throw new ConflictException('El proveedor con este DNI ya existe');
    }

    const supplier = this.supplierRepository.create(createSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(query: FindAllSupplierQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.supplierRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

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
    return this.supplierRepository.findOneBy({ id });
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.supplierRepository.findOneBy({ id });

    if (!supplier) {
      throw new NotFoundException('El proveedor no existe');
    }

    const supplierExisting = await this.supplierRepository.findOneBy({ dni: updateSupplierDto.dni });


    if (supplierExisting && supplierExisting.id !== id) {
      throw new ConflictException('El proveedor con este DNI ya existe');
    }

    return this.supplierRepository.update(id, updateSupplierDto);
  }

  async remove(id: number) {
    const supplier = await this.supplierRepository.findOneBy({ id });
    if (!supplier) {
      throw new NotFoundException('El proveedor no existe');
    }
    return this.supplierRepository.update(id, { active: false });
  }
}
