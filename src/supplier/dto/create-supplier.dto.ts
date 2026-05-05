import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { SupplierType } from "../enums/supplier-type.enum";

export class CreateSupplierDto {
    @IsEnum(SupplierType)
    type!: SupplierType;

    @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.NATURAL)
    @IsString()
    @MinLength(4)
    @MaxLength(155)
    fullName?: string;

    @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
    @IsString()
    @MinLength(3)
    @MaxLength(155)
    businessName?: string;

    @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.NATURAL)
    @IsString()
    @MinLength(8)
    @MaxLength(12)
    dni?: string;

    @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
    @IsString()
    @MinLength(11)
    @MaxLength(14)
    ruc?: string;

    @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
    @IsString()
    @MinLength(4)
    @MaxLength(155)
    contactFullName?: string;

    @ValidateIf((dto: CreateSupplierDto) => dto.type === SupplierType.JURIDICA)
    @IsString()
    @MinLength(8)
    @MaxLength(12)
    contactDni?: string;

    @IsString()
    @MinLength(7)
    @MaxLength(15)
    phone!: string;

    @IsEmail()
    @MinLength(5)
    @MaxLength(255)
    email!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(255)
    address!: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
