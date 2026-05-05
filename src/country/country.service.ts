import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';

@Injectable()
export class CountryService {
    constructor(
        @InjectRepository(Country)
        private readonly countryRepository: Repository<Country>,
    ) {}

    findActive(): Promise<Country[]> {
        return this.countryRepository.find({ where: { active: true }, order: { name: 'ASC' } });
    }
}
