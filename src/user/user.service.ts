import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUser } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getMe(id: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) return new NotFoundException();

      delete user.password;
      return { user };
    } catch (error) {
      throw new error();
    }
  }

  async editUser(id: number, dto: EditUser) {
    try {
      if (Object.keys(dto).length === 0)
        return new BadRequestException('Must provided firstName or lastName');

      const user = await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          ...dto,
        },
      });
      delete user.password;
      return { user };
    } catch (error) {
      throw error;
    }
  }
}
