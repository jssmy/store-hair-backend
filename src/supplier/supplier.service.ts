import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { InjectRepository } from '@nestjs/typeorm';

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

  findAll() {
    return this.supplierRepository.find();
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
