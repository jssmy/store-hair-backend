import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../domain/auth-user.entity';
import { IAuthServicePort } from '../domain/auth-service.port';
import { UserEntity } from '../infrastructure/user.entity';
import { RegisterDto } from './register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements IAuthServicePort {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
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
  }> {
    const payload = { sub: user.id, fullname: user.name, email: user.email };
    return Promise.resolve({
      access_token: this.jwtService.sign(payload, { expiresIn: '15m', }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7h', }),
    })
  }

  async register(dto: RegisterDto): Promise<{ access_token: string; refresh_token: string; }> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const saved = await this.userRepository.save(
      this.userRepository.create({ email: dto.email, name: dto.name, password: hashed }),
    );

    return this.login(new AuthUser(saved.id, saved.email, saved.name));
  }
}
