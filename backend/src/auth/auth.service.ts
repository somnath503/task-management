import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async guestLogin() {
    // Generate a unique guest identifier
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const guestUsername = `guest_${randomSuffix}`;

    // Create the temporary guest user in the database
    const user = await this.prisma.user.create({
      data: {
        username: guestUsername,
        role: 'guest',
      },
    });

    // Create the JWT payload
    const payload = { sub: user.id, username: user.username, role: user.role };
    
    // Return the token and user details
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }
}