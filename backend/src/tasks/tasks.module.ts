import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import Prisma

@Module({
  imports: [PrismaModule], // Make Prisma available to TasksService
  providers: [TasksService],
  controllers: [TasksController]
})
export class TasksModule {}