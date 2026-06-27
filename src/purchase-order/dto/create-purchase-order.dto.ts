import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { CreatePurchaseOrderDetailDto } from './create-purchase-order-detail.dto';

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 1, description: 'ID del proveedor asociado a la orden', minimum: 1 })
  @IsNumber()
  @IsPositive()
  supplierId!: number;

  @ApiPropertyOptional({ example: 'COP', description: 'Moneda en la que se realiza la compra (PEN, COP, USD, etc.)' })
  @IsOptional()
  @IsString()
  purchase_currency?: string;

  @ApiPropertyOptional({ example: 4200.5, description: 'Tipo de cambio COP → USD (cuántos COP equivalen a 1 USD)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tc_cop_usd?: number;

  @ApiPropertyOptional({ example: 3.75, description: 'Tipo de cambio COP → moneda de compra (cuántos COP equivalen a 1 unidad de purchase_currency)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tc_cop_purchase_currency?: number;

  @ApiProperty({ type: [CreatePurchaseOrderDetailDto], description: 'Detalle de productos de la orden (mínimo 1)', minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderDetailDto)
  details!: CreatePurchaseOrderDetailDto[];
}
