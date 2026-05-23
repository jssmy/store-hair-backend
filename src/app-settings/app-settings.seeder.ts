import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from './entities/app-settings.entity';

const DEFAULTS: AppSettings = {
    id: 1,
    companyName: 'LOUVRE EXTENSIONS',
    address: 'TV 33A#70A-21',
    phone: '+57901838872',
    email: '',
    taxId: '',
};

@Injectable()
export class AppSettingsSeeder implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(AppSettings)
        private readonly repo: Repository<AppSettings>,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const exists = await this.repo.findOne({ where: { id: 1 } });
        if (!exists) {
            await this.repo.save(DEFAULTS);
        }
    }
}
