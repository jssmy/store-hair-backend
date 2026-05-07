import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { LoteStatus } from '../enums/lote-status.enum';

export class UpdateLoteProductDto extends UpdateProductDto {
  @ApiProperty({ example: 1, description: 'ID numérico del producto a actualizar', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;
}

export class UpdateLoteDto {
  @ApiProperty({ enum: LoteStatus, example: LoteStatus.COMPLETED, description: 'Nuevo estado del lote', required: false })
  @IsOptional()
  @IsEnum(LoteStatus)
  status?: LoteStatus;

  @ApiProperty({ type: [UpdateLoteProductDto], description: 'Productos del lote a actualizar', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLoteProductDto)
  products?: UpdateLoteProductDto[];
}
