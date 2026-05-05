import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { IsBase64Image } from '../validators/is-base64-image.validator';

export class CreateProductDto {
  @ApiProperty({ example: 'liso', description: 'Tipo de producto (ej. liso, rizado, ondulado)', minLength: 1 })
  @IsString()
  @MinLength(1)
  type!: string;

  @ApiProperty({ example: 'negro natural', description: 'Color del producto', minLength: 5 })
  @IsString()
  @MinLength(5)
  color!: string;

  @ApiProperty({ example: 25.99, description: 'Precio unitario del producto', minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 40, description: 'Longitud del producto en centímetros', minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  length!: number;

  @ApiProperty({ example: 100, description: 'Peso del producto en gramos', minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  weight!: number;

  @ApiProperty({
    example: ['data:image/jpeg;base64,/9j/4AAQSkZJRgAB...'],
    description: 'Array de imágenes codificadas en Base64',
    type: [String],
  })
  @IsArray()
  @IsBase64Image({ each: true })
  images!: string[];
}
