import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from './entities/app-settings.entity';

@Injectable()
export class AppSettingsService {
    constructor(
        @InjectRepository(AppSettings)
        private readonly repo: Repository<AppSettings>,
    ) {}

    async get(): Promise<AppSettings> {
        const settings = await this.repo.findOne({ where: { id: 1 } });
        if (!settings) throw new NotFoundException('Configuración de la aplicación no encontrada');
        return settings;
    }

    async update(data: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
        await this.repo.update(1, data);
        return this.get();
    }
}
