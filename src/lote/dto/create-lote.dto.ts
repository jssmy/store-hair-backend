import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateProductDto } from 'src/product/dto/create-product.dto';

export class CreateLoteDto {
  @ApiProperty({
    type: [CreateProductDto],
    description: 'Lista de productos que conforman el lote (mínimo 1)',
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  products!: CreateProductDto[];
}
