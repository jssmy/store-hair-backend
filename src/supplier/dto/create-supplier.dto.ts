import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { SupplierType } from '../enums/supplier-type.enum';

export class CreateSupplierDto {
  @ApiProperty({ enum: SupplierType, example: SupplierType.NATURAL, description: 'Tipo de proveedor: NATURAL (persona natural) o JURIDICA (empresa)' })
  @IsEnum(SupplierType)
  type!: SupplierType;

  @ApiProperty({ example: 'Juan Pérez García', description: 'Nombre completo (solo para tipo NATURAL)', required: false, minLength: 4, maxLength: 155 })
  @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.NATURAL)
  @IsString()
  @MinLength(4)
  @MaxLength(155)
  fullName?: string;

  @ApiProperty({ example: 'Distribuidora García S.A.C.', description: 'Razón social (solo para tipo JURIDICA)', required: false, minLength: 3, maxLength: 155 })
  @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
  @IsString()
  @MinLength(3)
  @MaxLength(155)
  businessName?: string;

  @ApiProperty({ example: '12345678', description: 'DNI del proveedor (solo para tipo NATURAL)', required: false, minLength: 8, maxLength: 12 })
  @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.NATURAL)
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  dni?: string;

  @ApiProperty({ example: '20123456789', description: 'RUC de la empresa (solo para tipo JURIDICA)', required: false, minLength: 11, maxLength: 14 })
  @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
  @IsString()
  @MinLength(11)
  @MaxLength(14)
  ruc?: string;

  @ApiProperty({ example: 'María López', description: 'Nombre del contacto (solo para tipo JURIDICA)', required: false, minLength: 4, maxLength: 155 })
  @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
  @IsString()
  @MinLength(4)
  @MaxLength(155)
  contactFullName?: string;

  @ApiProperty({ example: '87654321', description: 'DNI del contacto de la empresa (solo para tipo JURIDICA)', required: false, minLength: 8, maxLength: 12 })
  @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  contactDni?: string;

  @ApiProperty({ example: '987654321', description: 'Número de teléfono de contacto', minLength: 7, maxLength: 15 })
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  phone!: string;

  @ApiProperty({ example: 'proveedor@email.com', description: 'Correo electrónico de contacto', minLength: 5, maxLength: 255 })
  @IsEmail()
  @MinLength(5)
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'Av. Los Olivos 123, Lima', description: 'Dirección del proveedor', minLength: 5, maxLength: 255 })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  address!: string;

  @ApiProperty({ example: true, description: 'Estado activo del proveedor', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
