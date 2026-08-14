import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if needed
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        priority: data.priority || 'Normal',
        lead: data.lead,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
    });
  }
  
update(id: string, data: any) {
    return this.prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        priority: data.priority,
        lead: data.lead,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }
  remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}