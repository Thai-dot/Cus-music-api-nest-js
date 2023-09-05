import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SongOwnerGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userID = request.user.id; // Assuming you have the user ID in the request object
    const songID = parseInt(request.params.songID, 10);

    // Implement your logic to check if the playListID belongs to the userID
    const getSpecificSong = await this.prismaService.song.findFirst({
      where: {
        id: songID,
      },
    });

    const isOwner = getSpecificSong.userID === parseInt(userID, 10);

    return isOwner;
  }
}
