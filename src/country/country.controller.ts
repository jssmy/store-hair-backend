import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/jwt-auth.guard';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';

@ApiTags('Country')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('country')
export class CountryController {
    constructor(private readonly countryService: CountryService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener países activos' })
    @ApiResponse({ status: 200, description: 'Lista de países activos', type: [Country] })
    findActive(): Promise<Country[]> {
        return this.countryService.findActive();
    }
}
