import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, ValidateNested } from 'class-validator';
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

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 1, description: 'ID de la orden de compra asociada al lote' })
  purchaseOrderId!: number;
}
