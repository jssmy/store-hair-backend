import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, ValidateNested } from "class-validator";
import { CreatePurchaseOrderDetailDto } from "./create-purchase-order-detail.dto";

export class CreatePurchaseOrderDto {
    @IsNumber()
    @IsPositive()
    supplierId!: number;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseOrderDetailDto)
    details!: CreatePurchaseOrderDetailDto[];

}
