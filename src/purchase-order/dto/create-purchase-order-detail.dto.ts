import { IsNumber, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreatePurchaseOrderDetailDto {
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    color!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    type!: string;


    @IsNumber()
    @IsPositive()
    length!: number;

    @IsNumber()
    @IsPositive()
    weight!: number;

    @IsNumber()
    @IsPositive()
    price!: number;

}