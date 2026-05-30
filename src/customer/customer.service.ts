import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { FindAllCustomerQueryDto } from './dto/find-all-customer-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) { }

  async create(createCustomerDto: CreateCustomerDto) {
    if (createCustomerDto.dni) {
      const existing = await this.customerRepository.findOneBy({ dni: createCustomerDto.dni });
      if (existing) {
        throw new ConflictException('Ya existe un cliente con este DNI');
      }
    }

    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAll(query: FindAllCustomerQueryDto) {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .orderBy('customer.createdAt', 'DESC');

    if (query.search) {
      queryBuilder.andWhere(
        '(customer.names ILIKE :search OR customer.phone LIKE :search OR customer.dni LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.active !== undefined) {
      queryBuilder.andWhere('customer.active = :active', { active: query.active });
    }

    const skip = (query.page - 1) * query.limit;
    queryBuilder.skip(skip).take(query.limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / query.limit);

    return {
      data,
      meta: { total, page: query.page, limit: query.limit, totalPages },
    }
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException('El cliente no existe');
    }
    return customer;
  }

  async update(dni: string, updateCustomerDto: UpdateCustomerDto) {

    const customer = await this.customerRepository.findOneBy({ dni });
    if (!customer) {
      throw new NotFoundException('El cliente no existe');
    }
    await this.customerRepository.update(customer.id, updateCustomerDto);
    return this.customerRepository.findOneBy({ id: customer.id });
  }

  async remove(id: number) {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException('El cliente no existe');
    }
    return this.customerRepository.update(id, { active: false });
  }
}
