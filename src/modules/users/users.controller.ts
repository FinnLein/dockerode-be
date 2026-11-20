import { S3Service } from '@config/s3/s3.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.getProfile(userId);

    const { password: _, ...rest } = user;

    return {
      ...rest,
      avatarUrl: rest.avatarUrl
        ? this.s3Service.getPublicUrl(rest.avatarUrl)
        : null,
    };
  }
}
