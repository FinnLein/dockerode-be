import { UsersService } from '@modules/users/users.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { AuthorizeDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: AuthorizeDto) {
    const { email, password } = dto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const user = await this.usersService.create({
      email,
      password: await hash(password),
    });

    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    return { token, message: 'Вы успешно зарегистрировались' };
  }

  async login(dto: AuthorizeDto) {
    const { email, password } = dto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isValid = await verify(user.password, password);
    if (!isValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    return { token, message: 'Вы успешно вошли' };
  }
}
