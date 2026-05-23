import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class FindAllUsersQueryDto {
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

  @ApiProperty({ example: 'Juan', description: 'Buscar por nombre o email', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: UserRole, description: 'Filtrar por rol', required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
