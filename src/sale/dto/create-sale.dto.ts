import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { SalePaymentMethod } from '../enums/sale-payment-method.enum';
import { CreateSaleDetailDto } from './create-sale-detail.dto';

export class CreateSaleDto {
  @ApiProperty({
    enum: SalePaymentMethod,
    example: SalePaymentMethod.CASH,
    description: 'Método de pago: cash (contado) o credit (crédito)',
  })
  @IsEnum(SalePaymentMethod)
  paymentMethod!: SalePaymentMethod;

  @ApiProperty({ example: 1, description: 'ID del cliente' })
  @IsInt()
  @IsPositive()
  customerId!: number;

  @ApiProperty({ type: [CreateSaleDetailDto], description: 'Productos de la venta (al menos uno)' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDetailDto)
  @ArrayMinSize(1)
  details!: CreateSaleDetailDto[];

  @ApiProperty({
    example: 100.0,
    description: 'Monto del abono pagado en efectivo. Para cash debe sumar el total junto a transferAmount.',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  cashAmount!: number;

  @ApiProperty({
    example: 50.0,
    description: 'Monto del abono pagado por transferencia. Para cash debe sumar el total junto a cashAmount.',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  transferAmount!: number;

  @ApiProperty({ example: 'Venta en tienda principal', description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
