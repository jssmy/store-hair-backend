import { AuthUser } from './auth-user.entity';

export interface IAuthServicePort {
  validateUser(identifier: string, password: string): Promise<AuthUser | null>;
  login(
    user: AuthUser,
  ): Promise<{ access_token: string; refresh_token: string; user: AuthUser }>;
}
