import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class FindAllCustomerQueryDto {
  @ApiProperty({ example: 1, description: 'Número de página', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página', required: false, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiProperty({ example: 'María', description: 'Buscar por nombre, teléfono o DNI', required: false, maxLength: 155 })
  @IsOptional()
  @IsString()
  @MaxLength(155)
  search?: string;

  @ApiProperty({ example: true, description: 'Filtrar por estado activo/inactivo', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  active?: boolean;
}
