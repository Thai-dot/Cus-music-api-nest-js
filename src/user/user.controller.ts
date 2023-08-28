import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { EditUser } from './dto/edit-user.dto';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('/edit')
  editUser(@GetUser('id') id: number, @Body() dto: EditUser) {
    return this.userService.editUser(id, dto);
  }
}
