import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRequest } from '@shared/types/users';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserRequest>(
    err: unknown,
    user: TUser,
    info?: Error,
  ): TUser {
    if (err) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException('Ошибка авторизации');
    }

    if (!user) {
      const isExpired = info?.name === 'TokenExpiredError';
      if (isExpired) {
        throw new UnauthorizedException(
          'Срок действия сессии истёк. Войдите снова',
        );
      }

      const isEmptyToken = info?.message === 'No auth token';
      if (isEmptyToken) {
        throw new UnauthorizedException(
          'Для выполнения этого действия необходимо войти в аккаунт',
        );
      }

      throw new UnauthorizedException('Невалидный токен авторизации');
    }

    return user;
  }
}
