import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateSaleDetailDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsInt()
  @IsPositive()
  productId!: number;

  @ApiProperty({ example: 150.00, description: 'Precio de venta del producto' })
  @IsNumber()
  @IsPositive()
  salePrice!: number;
}
