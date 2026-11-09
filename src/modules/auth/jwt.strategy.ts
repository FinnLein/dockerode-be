import { UsersService } from '@modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt.types';

const cookieExtractor = (req: Request): string | null => {
  const cookies = req?.cookies as Record<string, unknown> | undefined;

  if (cookies && typeof cookies['accessToken'] === 'string') {
    return cookies['accessToken'];
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return user;
  }
}
