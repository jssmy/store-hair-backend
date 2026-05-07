import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { LoteStatus } from '../enums/lote-status.enum';

export class FindAllLoteQueryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Filtrar lotes por ID de usuario', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: LoteStatus.PENDING, description: 'Filtrar lotes por estado', required: false, enum: LoteStatus })
  @IsOptional()
  @IsEnum(LoteStatus)
  status?: LoteStatus;

  @ApiProperty({ example: 'coleta rubia', description: 'Texto para buscar por lote, orden de compra, producto o usuario', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 1, description: 'Número de página', required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página', required: false, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
