import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

async create(data: CreateTaskDto) {
    this.logger.log(`Saving to Database: ${data.fullName}, Priority: ${data.priority}, Date: ${data.iepDue}`);
    
    return this.prisma.task.create({
      data: {
        fullName: data.fullName, 
        lastName: data.lastName,
        iepDue: data.iepDue ? new Date(data.iepDue) : null,
        evalDue: data.evalDue ? new Date(data.evalDue) : null,
        collaborators: data.collaborators,
        serviceTime: data.serviceTime,
        school: data.school,
        priority: data.priority || 'Normal',
        status: data.status || 'Backlog',
      },
    });
  }

  async findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}