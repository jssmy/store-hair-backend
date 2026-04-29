import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateSupplierDto {
    @IsString()
    @MinLength(4)
    name: string;

    @IsNumber()
    @MinLength(8)
    @MaxLength(12)
    dni: number;

    @IsString()
    @MinLength(7)
    @MaxLength(15)
    phone: string;

    @IsString()
    @MinLength(5)
    @MaxLength(255)
    email: string;

    @IsString()
    @MinLength(5)
    @MaxLength(255)
    address: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
