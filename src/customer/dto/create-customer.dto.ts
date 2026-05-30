import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'María López García', description: 'Nombre completo del cliente', minLength: 2, maxLength: 155 })
  @IsString()
  @MinLength(2)
  @MaxLength(155)
  names!: string;

  @ApiProperty({ example: '987654321', description: 'Número de teléfono del cliente', minLength: 7, maxLength: 15 })
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  phone!: string;

  @ApiProperty({ example: '12345678', description: 'DNI del cliente', required: false, minLength: 8, maxLength: 12 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  dni?: string;
}
