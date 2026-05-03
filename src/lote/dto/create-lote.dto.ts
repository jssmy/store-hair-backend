import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreateProductDto } from "src/product/dto/create-product.dto";

export class CreateLoteDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateProductDto)
    products!: CreateProductDto[];
}
