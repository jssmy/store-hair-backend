import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';

const ALLOWED_STATUSES = [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.CANCELED] as const;

export class UpdatePurchaseOrderStatusDto {
  @ApiProperty({
    enum: ALLOWED_STATUSES,
    description: 'Nuevo estado de la orden. Solo se permite cambiar de pendiente a aprobado o cancelado.',
    example: PurchaseOrderStatus.APPROVED,
  })
  @IsEnum(ALLOWED_STATUSES, { message: `El estado debe ser '${PurchaseOrderStatus.APPROVED}' o '${PurchaseOrderStatus.CANCELED}'` })
  status: typeof ALLOWED_STATUSES[number];
}
