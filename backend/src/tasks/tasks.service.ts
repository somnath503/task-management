import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        iepDue: createTaskDto.iepDue ? new Date(createTaskDto.iepDue) : null,
        evalDue: createTaskDto.evalDue ? new Date(createTaskDto.evalDue) : null,
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id); // Throws NotFoundException if missing

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        iepDue: updateTaskDto.iepDue ? new Date(updateTaskDto.iepDue) : undefined,
        evalDue: updateTaskDto.evalDue ? new Date(updateTaskDto.evalDue) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }
}