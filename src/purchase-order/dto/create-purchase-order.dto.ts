import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { CreatePurchaseOrderDetailDto } from './create-purchase-order-detail.dto';

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 1, description: 'ID del proveedor asociado a la orden', minimum: 1 })
  @IsNumber()
  @IsPositive()
  supplierId!: number;

  @ApiProperty({ type: [CreatePurchaseOrderDetailDto], description: 'Detalle de productos de la orden (mínimo 1)', minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderDetailDto)
  details!: CreatePurchaseOrderDetailDto[];
}
