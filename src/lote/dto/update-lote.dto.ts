import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { LoteStatus } from '../enums/lote-status.enum';

export class UpdateLoteProductDto extends UpdateProductDto {
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class UpdateLoteDto {
  @IsOptional()
  @IsEnum(LoteStatus)
  status?: LoteStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLoteProductDto)
  products?: UpdateLoteProductDto[];
}
