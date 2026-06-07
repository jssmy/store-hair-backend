import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { SalePaymentType } from '../enums/sale-payment-type.enum';
import { IsBase64Image } from 'src/product/validators/is-base64-image.validator';

export class CreateSalePaymentDto {
  @ApiProperty({ example: 150.0, description: 'Monto del pago (mayor a cero)' })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: SalePaymentType, example: SalePaymentType.CASH, description: 'Tipo de pago: cash (efectivo) o transfer (transferencia)' })
  @IsEnum(SalePaymentType)
  type!: SalePaymentType;

  @ApiProperty({
    example: 'data:image/jpeg;base64,/9j/4AAQ...',
    description: 'Imagen del comprobante en base64 (data URI) o URL. Formatos permitidos: jpg, png, webp. Opcional.',
    required: false,
  })
  @IsOptional()
  @IsBase64Image()
  imageUrl?: string;
}
