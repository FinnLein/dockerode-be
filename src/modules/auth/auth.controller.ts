import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthorizeDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setTokenCookie(res: Response, token: string) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
}
