import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.getProfile(userId);

    const { password: _, ...rest } = user;

    return rest;
  }
}
