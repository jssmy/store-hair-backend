import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';
import { CreatePurchaseOrderDetailDto } from './create-purchase-order-detail.dto';

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 1, description: 'ID del proveedor asociado a la orden', minimum: 1 })
  @IsNumber()
  @IsPositive()
  supplierId!: number;

  @ApiProperty({ example: 'USD', description: 'Moneda de la orden (ejemplo: USD, PEN)' })
  @IsString()
  exchangeCurrency!: string;

  @ApiProperty({ example: 3.5, description: 'Tipo de cambio aplicado a la orden (ejemplo: 3.5)' })
  @IsNumber()
  @IsPositive()
  exchangeRate!: number;


  @ApiProperty({ type: [CreatePurchaseOrderDetailDto], description: 'Detalle de productos de la orden (mínimo 1)', minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderDetailDto)
  details!: CreatePurchaseOrderDetailDto[];
}
