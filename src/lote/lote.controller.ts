import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoteService } from './lote.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { UpdateLoteStatusDto } from './dto/update-lote-status.dto';
import { AuthUser } from 'src/auth/domain/auth-user.entity';
import { CurrentUser } from 'src/auth/infrastructure/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/infrastructure/jwt-auth.guard';
import { FindAllLoteQueryDto } from './dto/find-all-lote-query.dto';

@ApiTags('Lotes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('lote')
export class LoteController {
  constructor(private readonly loteService: LoteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear lote', description: 'Crea un nuevo lote con uno o más productos. Asociado al usuario autenticado.' })
  @ApiResponse({ status: 201, description: 'Lote creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(
    @Body() createLoteDto: CreateLoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.loteService.create(createLoteDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lotes', description: 'Retorna la lista paginada de lotes. Se puede filtrar por userId.' })
  @ApiResponse({ status: 200, description: 'Lista paginada de lotes.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll(@Query() query: FindAllLoteQueryDto) {
    return this.loteService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener lote por ID', description: 'Retorna un lote específico por su UUID.' })
  @ApiParam({ name: 'id', description: 'UUID del lote', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Lote encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.loteService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del lote', description: 'Actualiza el estado de un lote. No se permite si el lote ya está completado.' })
  @ApiParam({ name: 'id', description: 'UUID del lote', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'No se puede actualizar el estado de un lote completado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  updateStatus(@Param('id') id: string, @Body() updateLoteStatusDto: UpdateLoteStatusDto) {
    return this.loteService.updateStatus(id, updateLoteStatusDto.status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar lote', description: 'Actualiza el estado o los productos de un lote existente.' })
  @ApiParam({ name: 'id', description: 'UUID del lote', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Lote actualizado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  update(@Param('id') id: string, @Body() updateLoteDto: UpdateLoteDto) {
    return this.loteService.update(id, updateLoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lote', description: 'Elimina un lote por su UUID.' })
  @ApiParam({ name: 'id', description: 'UUID del lote', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Lote eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  remove(@Param('id') id: string) {
    return this.loteService.remove(id);
  }
}
