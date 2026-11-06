import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

interface UserData {
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
