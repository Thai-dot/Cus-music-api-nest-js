import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SongDto } from './dto';

@Injectable()
export class SongService {
  constructor(private prismaService: PrismaService) {}

  async getAllSongByPlayList(id: number) {
    try {
      const getAllData = await this.prismaService.playListSong.findMany({
        where: {
          playListID: id,
        },
        include: {
          Song: true,
        },
      });

      return getAllData;
    } catch (error) {
      throw error;
    }
  }

  async getAllSongByUser(userID: number) {
    try {
      const filterData = await this.prismaService.song.findMany({
        where: {
          userID,
        },
      });

      return { data: filterData };
    } catch (error) {
      throw error;
    }
  }

  async getSingleSong(songID: number) {
    try {
      const getData = await this.prismaService.song.findFirst({
        where: {
          id: songID,
        },
      });

      return getData;
    } catch (error) {
      throw error;
    }
  }

  async createSong(id: number | null, dto: SongDto) {
    try {
      const data = await this.prismaService.song.create({
        data: {
          songName: dto.songName,
          songFileName: dto.songFileName,
          extension: dto.extension,
          imgURL: dto.imgURL,
          size: dto.size,
          type: dto.type,
          userID: id,
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async createSongByPlayList(userID: number, playListID: number, dto: SongDto) {
    try {
      const data = await this.prismaService.song.create({
        data: {
          songName: dto.songName,
          songFileName: dto.songFileName,
          extension: dto.extension,
          imgURL: dto.imgURL,
          size: dto.size,
          type: dto.type,
          userID: userID,
        },
      });

      const assignedToPlayList = await this.prismaService.playListSong.create({
        data: {
          songID: data.id,
          playListID: playListID,
        },
      });

      return {
        song: data,
        belongToPlayList: assignedToPlayList,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async updateSong(songID: number, dto: SongDto) {
    try {
      const updateData = await this.prismaService.song.update({
        data: {
          ...dto,
        },
        where: {
          id: songID,
        },
      });

      return updateData;
    } catch (error) {
      throw error;
    }
  }

  async deleteSong(
    userID: number,
    dto: number[],
  ): Promise<string | ForbiddenException> {
    const isOwner = await this.isSongOwner(userID, dto);

    if (!isOwner)
      return new ForbiddenException('User not allow to deleted these songs');

    const { count } = await this.prismaService.song.deleteMany({
      where: {
        id: { in: dto },
      },
    });

    return count === 0 ? 'nothing to delete' : 'deleted item(s) successfully';
  }

  async deleteAll(id: number): Promise<string> {
    const findSongs = await this.prismaService.playListSong.findMany({
      where: {
        playListID: id,
      },
      include: {
        Song: {
          select: {
            id: true,
          },
        },
      },
    });

    const getSongIDs = findSongs.map((item) => item.Song.id);

    const { count } = await this.prismaService.song.deleteMany({
      where: {
        id: {
          in: getSongIDs,
        },
      },
    });

    return count === 0 ? 'nothing to delete' : 'deleted item(s) successfully';
  }

  async isSongOwner(userID: number, songIDs: number[]): Promise<boolean> {
    const getSongs = await this.prismaService.song.findMany({
      where: {
        id: { in: songIDs },
      },
    });
    return getSongs.every((item) => item.userID === userID);
  }
}
