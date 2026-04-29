import { AuthUser } from './auth-user.entity';
import { RegisterDto } from '../application/register.dto';

export interface IAuthServicePort {
  validateUser(identifier: string, password: string): Promise<AuthUser | null>;
  login(
    user: AuthUser,
  ): Promise<{ access_token: string; refresh_token: string;}>;
  register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; refresh_token: string;}>;
}
