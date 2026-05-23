import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSettings } from './entities/app-settings.entity';
import { AppSettingsService } from './app-settings.service';
import { AppSettingsSeeder } from './app-settings.seeder';

@Module({
    imports: [TypeOrmModule.forFeature([AppSettings])],
    providers: [AppSettingsService, AppSettingsSeeder],
    exports: [AppSettingsService],
})
export class AppSettingsModule {}
