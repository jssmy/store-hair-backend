import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CountryController } from './country.controller';
import { CountrySeeder } from './country.seeder';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Country]), AuthModule],
    controllers: [CountryController],
    providers: [CountryService, CountrySeeder],
    exports: [TypeOrmModule],
})
export class CountryModule {}
