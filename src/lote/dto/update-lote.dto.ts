import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { LoteStatus } from '../enums/lote-status.enum';

export class UpdateLoteProductDto extends UpdateProductDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'UUID del producto a actualizar', required: false })
  @IsOptional()
  @IsUUID()
  id?: string;
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
