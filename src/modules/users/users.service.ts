import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

interface UserData {
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
}
