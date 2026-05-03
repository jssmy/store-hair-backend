import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../application/register.dto';
import { JwtAuthGuard } from '../infrastructure/jwt-auth.guard';
import { AuthUser } from '../domain/auth-user.entity';
import { JwtRefreshAuthGuard } from '../infrastructure/jwt-refresh-guard';
import { CurrentUser } from '../infrastructure/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: AuthUser
  ) {
    
    try {
      return this.authService.login(user);
    } catch (e) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  @Get('default')
  async defaultUser() {
    return this.authService.register({
      email: 'example@gmail.com',
      password: '123456',
      name: 'John Doe',
    });
  }
}
