import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({ example: 'María López García', description: 'Nombre completo del cliente', minLength: 2, maxLength: 155, required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(155)
  names?: string;

  @ApiProperty({ example: '987654321', description: 'Número de teléfono del cliente', minLength: 7, maxLength: 15, required: false })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  phone?: string;
}
