import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        title: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: any) {
    // Whitelist the fields a user is allowed to update
    const allowedUpdates = {
      ...(updateData.email && { email: updateData.email }),
      ...(updateData.fullName && { fullName: updateData.fullName }),
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.username && { username: updateData.username }),
    };

    return this.prisma.user.update({
      where: { id: userId },
      data: allowedUpdates,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        title: true,
      },
    });
  }
}