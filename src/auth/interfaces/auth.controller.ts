import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../application/register.dto';
import { JwtAuthGuard } from '../infrastructure/jwt-auth.guard';
import { AuthUser } from '../domain/auth-user.entity';
import { JwtRefreshAuthGuard } from '../infrastructure/jwt-refresh-guard';
import { CurrentUser } from '../infrastructure/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Valida credenciales y retorna access token y refresh token' })
  @ApiBody({ schema: { type: 'object', required: ['identifier', 'password'], properties: { identifier: { type: 'string', example: 'example@gmail.com' }, password: { type: 'string', example: '123456' } } } })
  @ApiResponse({ status: 200, description: 'Login exitoso. Retorna access_token y refresh_token.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() body: { identifier: string; password: string }) {
    const user = await this.authService.validateUser(body.identifier, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Registrar usuario', description: 'Crea un nuevo usuario. Requiere autenticación JWT.' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado.' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @ApiBearerAuth('refresh-token')
  @ApiOperation({ summary: 'Refrescar token', description: 'Genera un nuevo access token usando el refresh token en el header Authorization.' })
  @ApiResponse({ status: 200, description: 'Tokens renovados exitosamente.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado.' })
  async refresh(@CurrentUser() user: AuthUser) {
    try {
      return this.authService.login(user);
    } catch (e) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  @Get('default')
  @ApiOperation({ summary: 'Crear usuario de prueba', description: 'Crea o retorna el usuario de prueba (example@gmail.com / 123456). Solo para desarrollo.' })
  @ApiResponse({ status: 200, description: 'Usuario de prueba creado o retornado.' })
  async defaultUser() {
    return this.authService.register({
      email: 'example@gmail.com',
      password: '123456',
      name: 'John Doe',
    });
  }
}
