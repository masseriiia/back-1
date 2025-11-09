import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  user: UserEntity;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      birthDate: new Date(registerDto.birthDate),
    });

    const accessToken = await this.generateToken(user.id, user.email);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateToken(user.id, user.email);

    return {
      user: new UserEntity(user),
      accessToken,
    };
  }

  async validateUser(userId: string): Promise<UserEntity> {
    return this.usersService.findById(userId);
  }

  private async generateToken(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
