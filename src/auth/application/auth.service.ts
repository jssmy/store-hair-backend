import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../domain/auth-user.entity';
import { IAuthServicePort } from '../domain/auth-service.port';
import { UserEntity } from '../infrastructure/user.entity';

@Injectable()
export class AuthService implements IAuthServicePort {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async validateUser(identifier: string, password: string): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({ where: { email: identifier } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return new AuthUser(user.id, user.email, user.name);
  }

  login(user: AuthUser): Promise<{
    access_token: string;
    refresh_token: string;
    user: AuthUser;
  }> {
    const payload = { sub: user.id, email: user.email };
    return Promise.resolve({
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user,
    });
  }
}
