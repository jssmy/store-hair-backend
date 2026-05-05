import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'Correo electrónico del usuario' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Contraseña del usuario' })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo del usuario', required: false })
  name?: string;
}
