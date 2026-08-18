import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    // If JWT is not active, we grab the first user in the DB (or create a default one)
    if (userId === 'mock-user-id') {
      let guestUser = await this.prisma.user.findFirst();
      
      if (!guestUser) {
        guestUser = await this.prisma.user.create({
          data: {
            username: 'Dexuser',
            email: 'dexter@gmail.com',
            fullName: 'Dexter',
            title: 'Designer',
            role: 'guest',
          },
        });
      }
      return guestUser;
    }

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
    let targetId = userId;
    if (userId === 'mock-user-id') {
      const guestUser = await this.prisma.user.findFirst();
      if (guestUser) targetId = guestUser.id;
    }

    const allowedUpdates = {
      ...(updateData.email && { email: updateData.email }),
      ...(updateData.fullName && { fullName: updateData.fullName }),
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.username && { username: updateData.username }),
    };

    return this.prisma.user.update({
      where: { id: targetId },
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