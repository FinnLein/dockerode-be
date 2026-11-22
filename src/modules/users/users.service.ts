import { S3Service } from '@config/s3/s3.service';
import { faker } from '@faker-js/faker';
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { toSvg } from 'jdenticon';
import { UsersRepository } from './users.repository';

interface UserData {
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly s3Service: S3Service,
  ) {}

  async getProfile(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  create(data: UserData) {
    return this.usersRepository.create(data);
  }

  async createGuest(customName?: string | null) {
    const trimmedName = customName?.trim();
    const guestName = trimmedName || this.generateRandomGuestName();

    const avatarUrl = await this.generateAndUploadAvatar(
      `${guestName}-${randomUUID()}`,
    );

    return this.usersRepository.createGuest({
      name: guestName,
      avatarUrl,
    });
  }

  private generateRandomGuestName(): string {
    const rawName = `${faker.word.adjective()} ${faker.animal.type()}`;
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const tag = faker.number.int({ min: 100, max: 999 });

    return `${formattedName} #${tag}`;
  }

  private async generateAndUploadAvatar(seed: string): Promise<string> {
    const svg = toSvg(seed, 200);
    const buffer = Buffer.from(svg);
    const key = `avatars/${randomUUID()}.svg`;

    return this.s3Service.uploadBuffer(buffer, key, 'image/svg+xml');
  }
}
