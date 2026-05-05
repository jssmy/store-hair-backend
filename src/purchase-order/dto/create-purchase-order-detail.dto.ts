import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePurchaseOrderDetailDto {
  @ApiProperty({ example: 'negro natural', description: 'Color del producto', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  color!: string;

  @ApiProperty({ example: 'liso', description: 'Tipo de producto', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  type!: string;

  @ApiProperty({ example: 40, description: 'Longitud del producto en centímetros', minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  length!: number;

  @ApiProperty({ example: 100, description: 'Peso del producto en gramos', minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  weight!: number;

  @ApiProperty({ example: 25.99, description: 'Precio unitario pactado en la orden', minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  price!: number;
}
