import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAllProductQueryDto {
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

  @ApiProperty({ example: 'Liso', description: 'Filtrar por tipo de producto (coincidencia exacta)', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'Negro', description: 'Filtrar por color (coincidencia exacta)', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: true, description: 'Filtrar por estado activo/inactivo', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ example: 'Coleta', description: 'Búsqueda por nombre, tipo o color', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
