import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Import the standard AuthGuard
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Apply the guard so NestJS extracts the token
  @UseGuards(AuthGuard('jwt')) 
  @Get('me')
  getProfile(@Request() req: any) {
    // 2. Remove the mock fallback. Use the real database UUID from the token.
    const userId = req.user.sub; 
    return this.usersService.getProfile(userId);
  }

  // 1. Apply the guard here too
  @UseGuards(AuthGuard('jwt')) 
  @Patch('me')
  updateProfile(@Request() req: any, @Body() updateData: any) {
    // 2. Use the real database UUID
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, updateData);
  }
}