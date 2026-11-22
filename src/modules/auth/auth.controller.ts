import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GuestAuthResponseDto } from './dto/guest-auth-response.dto';
import { GuestLoginDto } from './dto/guest-login.dto';
import { AuthorizeDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  private setTokenCookie(res: Response, token: string) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearTokenCookie(res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  @Post('register')
  async register(
    @Body() dto: AuthorizeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, message } = await this.authService.register(dto);
    this.setTokenCookie(res, token);
    return { message };
  }

  @Post('login')
  async login(
    @Body() dto: AuthorizeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, message } = await this.authService.login(dto);
    this.setTokenCookie(res, token);
    return { message };
  }

  @Post('guest')
  async loginAsGuest(
    @Body() dto: GuestLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GuestAuthResponseDto> {
    const { token, user, message } = await this.authService.loginAsGuest(
      dto?.name,
    );
    this.setTokenCookie(res, token);

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      message,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearTokenCookie(res);
    return { message: 'Вы успешно вышли' };
  }
}
