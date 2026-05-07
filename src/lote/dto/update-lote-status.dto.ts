import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LoteStatus } from '../enums/lote-status.enum';

export class UpdateLoteStatusDto {
  @ApiProperty({ enum: LoteStatus, example: LoteStatus.PENDING, description: 'Nuevo estado del lote' })
  @IsNotEmpty()
  @IsEnum(LoteStatus)
  status!: LoteStatus;
}
