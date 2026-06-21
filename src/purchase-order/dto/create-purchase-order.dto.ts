import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { CreatePurchaseOrderDetailDto } from './create-purchase-order-detail.dto';

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 1, description: 'ID del proveedor asociado a la orden', minimum: 1 })
  @IsNumber()
  @IsPositive()
  supplierId!: number;

  @ApiPropertyOptional({ example: 4200.5, description: 'Tipo de cambio COP → USD al momento de la orden' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tc_usd?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Moneda de conversión (ejemplo: USD, EUR)' })
  @IsOptional()
  @IsString()
  tc_converted_currency?: string;

  @ApiPropertyOptional({ example: 250.75, description: 'Valor total de la orden expresado en la moneda de conversión' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tc_converted_value?: number;

  @ApiProperty({ type: [CreatePurchaseOrderDetailDto], description: 'Detalle de productos de la orden (mínimo 1)', minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderDetailDto)
  details!: CreatePurchaseOrderDetailDto[];
}
