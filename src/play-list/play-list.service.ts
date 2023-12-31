import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlayListDto, QueryGetAllPlayList, ReorderMap } from './dto';
import { SearchService } from 'src/elasticsearch/search.service';
import { ES_INDEX_NAME } from 'src/constant/elastic.constant';
import { getImgFilePath } from 'src/constant/file-path.constant';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import UserSecureSelect from 'src/constant/user-secure-select';
import stringToBoolean from 'src/util/convert-string-to-boolean';

@Injectable()
export class PlayListService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly elasticSearch: SearchService,
    private readonly imgUploadService: ImageUploadService,
  ) {}

  async getAllPlayList(query: QueryGetAllPlayList) {
    try {
      const {
        searchName,
        limit,
        page,
        sortBy,
        sortType,
        type,
        visibility,
        isLove,
      } = query;

      const queryBody: any = [];

      if (visibility) {
        queryBody.push({
          match: {
            visibility: visibility,
          },
        });
      }

      if (type !== undefined) {
        queryBody.push({
          match: {
            type: type,
          },
        });
      }
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
      const {
        searchName,
        limit,
        page,
        sortBy,
        sortType,
        visibility,
        type,
        isLove,
      } = query;
      const convertIsLove = stringToBoolean(isLove?.toString());

      const queryBody: any = [
        {
          match: {
            userID: userID,
          },
        },
      ];

      if (visibility) {
        queryBody.push({
          match: {
            visibility: visibility,
          },
        });
      }

      if (type !== undefined) {
        queryBody.push({
          match: {
            type: type,
          },
        });
      }
      if (searchName?.length !== 0) {
        queryBody.push({
          match_phrase_prefix: {
            name: searchName,
          },
        });
      }

      let getLoveArray: any = [];

      if (convertIsLove) {
        const data = await this.prismaService.lovedPlayList.findMany({
          where: {
            userID: userID,
          },
        });

        getLoveArray = data.map((item) => item.playlistID);
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
            ...(convertIsLove
              ? {
                  filter: {
                    terms: {
                      id: getLoveArray,
                    },
                  },
                }
              : {}),
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
        },
        include: {
          song: {
            include: {
              Song: true,
            },
          },
          user: UserSecureSelect,
        },
      });

      if (data.visibility === false && data.userID !== userID) {
        throw new Error();
      }

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

      const getMaximumOrder = await this.prismaService.playListSong.aggregate({
        _max: {
          order: true,
        },
        where: { playListID },
      });

      const createData = songIDsDTO.map((songID) => {
        return {
          playListID,
          songID,
          order: getMaximumOrder._max.order + 1,
        };
      });
      await this.prismaService.playListSong.createMany({
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

  async reorderSongByPlaylist(playlistID: number, reorderMap: ReorderMap[]) {
    if (reorderMap.length === 0) {
      return new BadRequestException('Array is empty');
    }
    const oldReorder = await this.prismaService.playListSong.findMany({
      where: {
        playListID: playlistID,
      },
    });

    if (oldReorder.length !== reorderMap.length) {
      return new BadRequestException(
        'The provided array are not the same as the old order array',
      );
    }

    await Promise.all(
      reorderMap.map(async (item) => {
        await this.prismaService.playListSong.update({
          where: {
            playListID: playlistID,
            songID: item.songID,
            playListID_songID: { playListID: playlistID, songID: item.songID },
          },
          data: {
            order: item.order,
          },
        });
      }),
    );

    return 'Reordered successfully';
  }

  // Love playlist section

  async getLovePlaylist(userID: number, playlistID: number) {
    try {
      const data = await this.prismaService.lovedPlayList.findMany({
        where: {
          userID: userID,
          ...(!!playlistID
            ? {
                playlistID: playlistID,
              }
            : {}),
        },
        include: {
          Playlist: true,
        },
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async addLovePlaylist(playlistID: number, userID: number) {
    console.log(playlistID, userID);
    try {
      const data = await this.prismaService.lovedPlayList.create({
        data: {
          userID: userID,
          playlistID: playlistID,
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async removeLovePlaylist(playlistID: number, userID: number) {
    try {
      await this.prismaService.lovedPlayList.delete({
        where: {
          userID_playlistID: {
            userID: userID,
            playlistID: playlistID,
          },
        },
      });

      return 'Delete successfully';
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

      await this.findFileToDelete(dto);

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

  async findFileToDelete(dto: number[]) {
    const getDataBeforeDelete = await this.prismaService.playList.findMany({
      where: {
        id: {
          in: dto,
        },
      },
      select: {
        imgURL: true,
      },
    });

    const listOfImgFileName = getDataBeforeDelete.map((item) => item.imgURL);

    listOfImgFileName.forEach((item) => {
      const filePath = getImgFilePath(item);
      this.imgUploadService.deleteImgFile(item, filePath);
    });
  }
}
