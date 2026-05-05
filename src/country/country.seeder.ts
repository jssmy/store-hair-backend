import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';

const COUNTRIES: Omit<Country, 'suppliers'>[] = [
    { id: 'AR', name: 'Argentina', prefix: '+54', active: true },
    { id: 'BO', name: 'Bolivia', prefix: '+591', active: true },
    { id: 'BR', name: 'Brasil', prefix: '+55', active: true },
    { id: 'CL', name: 'Chile', prefix: '+56', active: true },
    { id: 'CO', name: 'Colombia', prefix: '+57', active: true },
    { id: 'CR', name: 'Costa Rica', prefix: '+506', active: true },
    { id: 'CU', name: 'Cuba', prefix: '+53', active: true },
    { id: 'DO', name: 'República Dominicana', prefix: '+1', active: true },
    { id: 'EC', name: 'Ecuador', prefix: '+593', active: true },
    { id: 'GT', name: 'Guatemala', prefix: '+502', active: true },
    { id: 'HN', name: 'Honduras', prefix: '+504', active: true },
    { id: 'MX', name: 'México', prefix: '+52', active: true },
    { id: 'NI', name: 'Nicaragua', prefix: '+505', active: true },
    { id: 'PA', name: 'Panamá', prefix: '+507', active: true },
    { id: 'PE', name: 'Perú', prefix: '+51', active: true },
    { id: 'PR', name: 'Puerto Rico', prefix: '+1', active: true },
    { id: 'PY', name: 'Paraguay', prefix: '+595', active: true },
    { id: 'SV', name: 'El Salvador', prefix: '+503', active: true },
    { id: 'US', name: 'Estados Unidos', prefix: '+1', active: true },
    { id: 'UY', name: 'Uruguay', prefix: '+598', active: true },
    { id: 'VE', name: 'Venezuela', prefix: '+58', active: true },
];

@Injectable()
export class CountrySeeder implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(Country)
        private readonly countryRepository: Repository<Country>,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const count = await this.countryRepository.count();
        if (count === 0) {
            await this.countryRepository.save(COUNTRIES);
        }
    }
}
