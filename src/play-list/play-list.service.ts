import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlayListDto, QueryGetAllPlayList } from './dto';
import { SearchService } from 'src/elasticsearch/search.service';
import { ES_INDEX_NAME } from 'src/constant/elastic.constant';

@Injectable()
export class PlayListService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly elasticSearch: SearchService,
  ) {}

  async getAllPlayList(query: QueryGetAllPlayList) {
    try {
      const { searchName, limit, page, sortBy, sortType } = query;

      const queryBody: any = [
        {
          match: {
            visibility: true,
          },
        },
      ];
      if (searchName?.length !== 0) {
        queryBody.push({
          match_phrase_prefix: {
            name: searchName,
          },
        });
      }

      const body = {
        from: (page - 1) * limit,
        size: limit,
        sort: [
          {
            [`${sortBy}.keyword`]: {
              order: sortType,
            },
          },
        ],
        query: {
          bool: {
            must: queryBody,
          },
        },
      };

      const data = await this.elasticSearch.searchIndex(
        ES_INDEX_NAME.playlist,
        body,
        '1m',
      );

      return {
        data: data.hits.hits,
        totalItems: data.hits.total,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPlayListByUser(userID: number, query: QueryGetAllPlayList) {
    try {
      const { searchName, limit, page, sortBy, sortType } = query;

      const queryBody: any = [
        {
          match: {
            visibility: true,
          },
        },
        {
          match: {
            userID: userID,
          },
        },
      ];
      if (searchName?.length !== 0) {
        queryBody.push({
          match_phrase_prefix: {
            name: searchName,
          },
        });
      }

      const body = {
        from: (page - 1) * limit,
        size: limit,
        sort: [
          {
            [`${sortBy}.keyword`]: {
              order: sortType,
            },
          },
        ],
        query: {
          bool: {
            must: queryBody,
          },
        },
      };

      const data = await this.elasticSearch.searchIndex(
        ES_INDEX_NAME.playlist,
        body,
        '1m',
      );

      return {
        data: data.hits.hits,
        totalItems: data.hits.total,
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

      await this.elasticSearch.updateDocument(
        ES_INDEX_NAME.playlist,
        updatePlayList.id.toString(),
        updatePlayList,
      );

      return updatePlayList;
    } catch (error) {
      throw error;
    }
  }

  async createPlayList(userId: number, dto: PlayListDto) {
    try {
      const playList = await this.prismaService.playList.create({
        data: {
          ...dto,
          userID: userId,
        },
      });

      await this.elasticSearch.addDocument(
        ES_INDEX_NAME.playlist,
        playList.id.toString(),
        playList,
      );

      return { playList };
    } catch (error) {
      throw error;
    }
  }

  async assignSongToPlayList(playListID: number, songIDsDTO: number[]) {
    try {
      if (songIDsDTO.length === 0)
        return new BadRequestException('Array is empty');

      const createData = songIDsDTO.map((songID) => ({
        playListID,
        songID,
      }));
      const result = await this.prismaService.playListSong.createMany({
        data: createData,
        skipDuplicates: true,
      });

      return {
        code: HttpStatus.ACCEPTED,
        message: 'Assigned song(s) successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async unassignedSongFromPlayList(playListID: number, songIDsDTO: number[]) {
    try {
      if (songIDsDTO.length === 0)
        return new BadRequestException('Array is empty');

      const { count } = await this.prismaService.playListSong.deleteMany({
        where: {
          songID: { in: songIDsDTO },
          playListID,
        },
      });

      return {
        code: HttpStatus.ACCEPTED,
        message: `Unassigned ${count} song(s) successfully`,
      };
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

      await this.elasticSearch.deleteMultipleDocuments(
        ES_INDEX_NAME.playlist,
        dto.map(String),
      );

      return {
        message: `deleted ${count} playlist(s)`,
      };
    } catch (error) {
      throw error;
    }
  }
}
