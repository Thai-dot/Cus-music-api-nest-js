import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlaylistOwnerGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userID = request.user.id; // Assuming you have the user ID in the request object
    const playListID = parseInt(request.params.id, 10);

    // Implement your logic to check if the playListID belongs to the userID
    const isOwner = await this.prismaService.playList.findFirst({
      where: {
        userID,
        id: playListID,
      },
    });

    return !!isOwner.id;
  }
}
