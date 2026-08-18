import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req: any) {
    const userId = req.user?.sub || 'mock-user-id'; 
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  updateProfile(@Request() req: any, @Body() updateData: any) {
    const userId = req.user?.sub || 'mock-user-id';
    return this.usersService.updateProfile(userId, updateData);
  }
}