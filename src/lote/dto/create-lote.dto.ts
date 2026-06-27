import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateLoteDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 1, description: 'ID de la orden de compra asociada al lote' })
  purchaseOrderId!: number;
}
