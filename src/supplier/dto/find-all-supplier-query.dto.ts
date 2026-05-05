import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SupplierType } from '../enums/supplier-type.enum';

export class FindAllSupplierQueryDto {
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

  @ApiProperty({ enum: SupplierType, example: SupplierType.NATURAL, description: 'Filtrar por tipo de proveedor', required: false })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

  @ApiProperty({ example: true, description: 'Filtrar por estado activo/inactivo', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  active?: boolean;
}
