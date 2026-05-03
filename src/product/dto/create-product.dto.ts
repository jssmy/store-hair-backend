import { IsArray, IsNumber, IsPositive, IsString, MinLength } from "class-validator";
import { IsBase64Image } from "../validators/is-base64-image.validator";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    type!: string;

    @IsString()
    @MinLength(5)
    color!: string;

    @IsNumber()
    @IsPositive()
    price!: number;

    @IsNumber()
    @IsPositive()
    length!: number;

    @IsNumber()
    @IsPositive()
    weight!: number;

    @IsArray()
    @IsBase64Image({ each: true })
    images!: string[];
}
