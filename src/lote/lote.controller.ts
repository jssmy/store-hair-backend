import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LoteService } from './lote.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { AuthUser } from 'src/auth/domain/auth-user.entity';
import { CurrentUser } from 'src/auth/infrastructure/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/infrastructure/jwt-auth.guard';
import { FindAllLoteQueryDto } from './dto/find-all-lote-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('lote')
export class LoteController {
  constructor(private readonly loteService: LoteService) {}

  @Post()
  create(
    @Body() createLoteDto: CreateLoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.loteService.create(createLoteDto, user);
  }

  @Get()
  findAll(@Query() query: FindAllLoteQueryDto) {
    return this.loteService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoteDto: UpdateLoteDto) {
    return this.loteService.update(id, updateLoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loteService.remove(id);
  }
}
