import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';

const COUNTRIES: Omit<Country, 'suppliers'>[] = [
    { id: 'AR', name: 'Argentina', prefix: '+54', currency: '$', currencyName: 'ARS', active: true },
    { id: 'BO', name: 'Bolivia', prefix: '+591', currency: 'Bs.', currencyName: 'BOB', active: true },
    { id: 'BR', name: 'Brasil', prefix: '+55', currency: 'R$', currencyName: 'BRL', active: true },
    { id: 'CL', name: 'Chile', prefix: '+56', currency: '$', currencyName: 'CLP', active: true },
    { id: 'CO', name: 'Colombia', prefix: '+57', currency: '$', currencyName: 'COP', active: true },
    { id: 'CR', name: 'Costa Rica', prefix: '+506', currency: '₡', currencyName: 'CRC', active: true },
    { id: 'CU', name: 'Cuba', prefix: '+53', currency: '$', currencyName: 'CUP', active: true },
    { id: 'DO', name: 'República Dominicana', prefix: '+1', currency: '$', currencyName: 'DOP', active: true },
    { id: 'EC', name: 'Ecuador', prefix: '+593', currency: '$', currencyName: 'USD', active: true },
    { id: 'GT', name: 'Guatemala', prefix: '+502', currency: 'Q', currencyName: 'GTQ', active: true },
    { id: 'HN', name: 'Honduras', prefix: '+504', currency: 'L', currencyName: 'HNL', active: true },
    { id: 'MX', name: 'México', prefix: '+52', currency: '$', currencyName: 'MXN', active: true },
    { id: 'NI', name: 'Nicaragua', prefix: '+505', currency: 'C$', currencyName: 'NIO', active: true },
    { id: 'PA', name: 'Panamá', prefix: '+507', currency: 'B/.', currencyName: 'PAB', active: true },
    { id: 'PE', name: 'Perú', prefix: '+51', currency: 'S/', currencyName: 'PEN', active: true },
    { id: 'PR', name: 'Puerto Rico', prefix: '+1', currency: '$', currencyName: 'USD', active: true },
    { id: 'PY', name: 'Paraguay', prefix: '+595', currency: '₲', currencyName: 'PYG', active: true },
    { id: 'SV', name: 'El Salvador', prefix: '+503', currency: '$', currencyName: 'USD', active: true },
    { id: 'US', name: 'Estados Unidos', prefix: '+1', currency: '$', currencyName: 'USD', active: true },
    { id: 'UY', name: 'Uruguay', prefix: '+598', currency: '$', currencyName: 'UYU', active: true },
    { id: 'VE', name: 'Venezuela', prefix: '+58', currency: 'Bs.S', currencyName: 'VES', active: true },
];

@Injectable()
export class CountrySeeder implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(Country)
        private readonly countryRepository: Repository<Country>,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.countryRepository.upsert(COUNTRIES, ['id']);
    }
}
