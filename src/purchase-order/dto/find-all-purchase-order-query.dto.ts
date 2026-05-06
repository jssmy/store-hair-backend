import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';

export class FindAllPurchaseOrderQueryDto {
  @ApiProperty({ example: 1, description: 'Número de página', required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Cantidad de registros por página', required: false, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  

  @ApiProperty({ example: 1, description: 'Filtrar por ID de proveedor', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supplierId?: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Filtrar por ID de usuario', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: PurchaseOrderStatus.PENDING, description: 'Filtrar por estado de la orden', required: false, enum: PurchaseOrderStatus })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiProperty({ example: 'OC-2025-10', description: 'Buscar por número de OC o nombre del proveedor', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
