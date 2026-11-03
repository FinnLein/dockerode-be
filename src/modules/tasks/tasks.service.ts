import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create.dto';
import { UpdateTaskDto } from './dto/update.dto';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
	constructor(private readonly tasksRepository: TasksRepository) { }

	findAll() {
		return this.tasksRepository.findAll();
	}

	async findOne(id: string) {
		const task = await this.tasksRepository.findOne(id);
		if (!task) {
			throw new NotFoundException('Задача не найдена');
		}
		return task;
	}

	create(dto: CreateTaskDto) {
		return this.tasksRepository.create(dto);
	}

	async update(id: string, dto: UpdateTaskDto) {
		await this.findOne(id);
		return this.tasksRepository.update(id, dto);
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.tasksRepository.remove(id);
	}
}