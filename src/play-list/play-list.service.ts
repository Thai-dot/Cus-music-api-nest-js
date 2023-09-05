import { type } from 'os';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlayListDto, QueryGetAllPlayList } from './dto';

@Injectable()
export class PlayListService {
  constructor(private prismaService: PrismaService) {}

  async getPlayListByUser(userID: number, query: QueryGetAllPlayList) {
    try {
      const { searchName, limit, page, sortBy, sortType } = query;

      const where = {
        name: { contains: searchName },
        userID,
      };

      const [totalItem, playListData] = await Promise.all([
        this.prismaService.playList.count({
          where,
        }),
        this.prismaService.playList.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: {
            [sortBy]: sortType,
          },
        }),
      ]);

      return {
        data: playListData,
        pagination: {
          totalItem,
          limit,
          page,
          hasItem: (page - 1) * limit < totalItem,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getOnePlayList(id: number, userID: number) {
    try {
      const data = await this.prismaService.playList.findFirst({
        where: {
          id,
          userID,
        },
        include: {
          song: true,
        },
      });

      if (Object.keys(data).length === 0)
        return new NotFoundException("Can't find any playlist");

      return data;
    } catch (error) {
      throw error;
    }
  }

  async updatePlayList(id: number, userID: number, dto: PlayListDto) {
    try {
      const updatePlayList = await this.prismaService.playList.update({
        where: {
          id,
          userID,
        },
        data: {
          ...dto,
        },
      });

      return updatePlayList;
    } catch (error) {
      throw error;
    }
  }

  async createPlayList(userId: number, dto: PlayListDto) {
    try {
      const playList = await this.prismaService.playList.create({
        data: {
          name: dto.name,
          type: dto.type,
          userID: userId,
        },
      });

      return { playList };
    } catch (error) {
      throw error;
    }
  }

  async deletePlayLists(userID: number, dto: number[]) {
    try {
      if (!dto || dto.length === 0)
        return new BadRequestException('delete array not provided');

      const findPlaylist = await this.prismaService.playList.findMany({
        select: {
          id: true,
        },
        where: {
          userID,
          id: { in: dto },
        },
      });

      if (findPlaylist.length === 0)
        return new NotFoundException(
          'There is no playlist to delete or wrong user',
        );

      const { count } = await this.prismaService.playList.deleteMany({
        where: {
          userID,
          id: { in: dto },
        },
      });

      return {
        message: `deleted ${count} playlist(s)`,
      };
    } catch (error) {
      throw error;
    }
  }
}
