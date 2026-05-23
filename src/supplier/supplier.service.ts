import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindAllSupplierQueryDto } from 'src/supplier/dto/find-all-supplier-query.dto';
import { SupplierType } from './enums/supplier-type.enum';

@Injectable()
export class SupplierService {

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

  ) { }

  private ensureRequiredFieldsByType(payload: CreateSupplierDto | UpdateSupplierDto, type: SupplierType) {
    if (type === SupplierType.NATURAL) {
      if (!payload.fullName || !payload.dni) {
        throw new BadRequestException('Para proveedor persona natural, los campos fullName y dni son obligatorios');
      }
      return;
    }

    if (type === SupplierType.JURIDICA) {
      if (!payload.businessName || !payload.ruc || !payload.contactFullName || !payload.contactDni) {
        throw new BadRequestException(
          'Para proveedor persona juridica, los campos businessName, ruc, contactFullName y contactDni son obligatorios',
        );
      }
    }
  }

  private normalizedFieldsByType(type: SupplierType): Partial<Supplier> {
    if (type === SupplierType.NATURAL) {
      return {
        businessName: null,
        ruc: null,
        contactFullName: null,
        contactDni: null,
      };
    }

    return {
      fullName: null,
      dni: null,
    };
  }

  async create(createSupplierDto: CreateSupplierDto) {
    this.ensureRequiredFieldsByType(createSupplierDto, createSupplierDto.type);
    const normalizedFields = this.normalizedFieldsByType(createSupplierDto.type);

    if (createSupplierDto.dni) {
      const existingByDni = await this.supplierRepository.findOneBy({ dni: createSupplierDto.dni });
      if (existingByDni) {
        throw new ConflictException('El proveedor con este DNI ya existe');
      }
    }

    if (createSupplierDto.ruc) {
      const existingByRuc = await this.supplierRepository.findOneBy({ ruc: createSupplierDto.ruc });
      if (existingByRuc) {
        throw new ConflictException('El proveedor con este RUC ya existe');
      }
    }

    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
      ...normalizedFields,
    });
    return this.supplierRepository.save(supplier);
  }

  async findAll(query: FindAllSupplierQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
    .leftJoinAndSelect('supplier.user', 'user')
    .leftJoinAndSelect('supplier.country', 'country')
    .addSelect(['user.id', 'user.name', 'country.id', 'country.name', 'country.prefix','country.currency','country.currencyName'])
    .orderBy('supplier.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

    if (query.type !== undefined) {
      queryBuilder.andWhere('supplier.type = :type', { type: query.type });
    }

    if (query.active !== undefined) {
      queryBuilder.andWhere('supplier.active = :active', { active: query.active });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
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

    const finalType = updateSupplierDto.type ?? supplier.type;
    this.ensureRequiredFieldsByType({ ...supplier, ...updateSupplierDto } as UpdateSupplierDto, finalType);
    const normalizedFields = this.normalizedFieldsByType(finalType);

    if (updateSupplierDto.dni) {
      const supplierExistingByDni = await this.supplierRepository.findOneBy({ dni: updateSupplierDto.dni });
      if (supplierExistingByDni && supplierExistingByDni.id !== id) {
        throw new ConflictException('El proveedor con este DNI ya existe');
      }
    }

    if (updateSupplierDto.ruc) {
      const supplierExistingByRuc = await this.supplierRepository.findOneBy({ ruc: updateSupplierDto.ruc });
      if (supplierExistingByRuc && supplierExistingByRuc.id !== id) {
        throw new ConflictException('El proveedor con este RUC ya existe');
      }
    }

    return this.supplierRepository.update(id, {
      ...updateSupplierDto,
      ...normalizedFields,
      type: finalType,
    });
  }

  async remove(id: number) {
    const supplier = await this.supplierRepository.findOneBy({ id });
    if (!supplier) {
      throw new NotFoundException('El proveedor no existe');
    }
    return this.supplierRepository.update(id, { active: false });
  }
}
