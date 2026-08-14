import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Uncomment when your guard is ready

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard) // Protect this route once your Auth Guard is set up
  @Get('profile')
  getProfile(@Request() req: any) {
    // For now, we will mock the userId until the JWT guard is active.
    // Once active, replace 'mock-user-id' with req.user.sub
    const userId = req.user?.sub || 'mock-user-id'; 
    return this.usersService.getProfile(userId);
  }

  // @UseGuards(JwtAuthGuard) // Protect this route once your Auth Guard is set up
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() updateData: any) {
    const userId = req.user?.sub || 'mock-user-id';
    return this.usersService.updateProfile(userId, updateData);
  }
}