import { Controller, Get, Patch, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Helper function to manually extract your Postgres UUID from the token
  private extractUserId(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const token = authHeader.split(' ')[1];
      // Decode the payload part of the JWT
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.sub; // This is your real Postgres UUID!
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }

  @Get('me')
  getProfile(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  updateProfile(@Headers('authorization') authHeader: string, @Body() updateData: any) {
    const userId = this.extractUserId(authHeader);
    return this.usersService.updateProfile(userId, updateData);
  }
}