import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SongDto } from './dto';
import { SearchService } from 'src/elasticsearch/search.service';
import { ES_INDEX_NAME } from 'src/constant/elastic.constant';
import { SongQueryDTO } from './dto/song-query.dto';
import { SongUploadService } from 'src/song-upload/song-upload.service';
import {
  getImgFilePath,
  getSongFilePath,
} from 'src/constant/file-path.constant';
import { ImageUploadService } from 'src/image-upload/image-upload.service';

@Injectable()
export class SongService {
  constructor(
    private prismaService: PrismaService,
    private searchService: SearchService,
    private songUploadService: SongUploadService,
    private imgUploadService: ImageUploadService,
  ) {}

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

  async getAllSongByUser(userID: number, queryDTO: SongQueryDTO) {
    try {
      const { songName, type, limit, page, visibility } = queryDTO;

      const queryBody: any = [];
      if (visibility) {
        queryBody.push({
          match: {
            visibility: visibility,
          },
        });
      }

      if (songName !== undefined) {
        queryBody.push({
          match_phrase_prefix: {
            songName: songName,
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
      const query =
        queryBody.length === 0
          ? null
          : {
              bool: {
                must: queryBody,
              },
            };

      const body = {
        from: (page - 1) * limit,
        size: limit,
      };

      if (query !== null) {
        body['query'] = query;
      }
      const data = await this.searchService.searchIndex(
        ES_INDEX_NAME.song,
        body,
        '1m',
      );

      return { data: data.hits.hits, totalItems: data.hits.total };
    } catch (error) {
      throw error;
    }
  }

  async getSingleSong(songID: number) {
    try {
     
      const updatedSong = await this.prismaService.song.update({
        where: { id: songID },
        data: { listenTimes: { increment: 1 } },
  
      });
      await this.searchService.updateDocument(
        ES_INDEX_NAME.song,
        songID.toString(),
        updatedSong,
      );

      return updatedSong;
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
          visibility: dto.visibility,
          userID: id,
        },
      });

      await this.searchService.addDocument(
        ES_INDEX_NAME.song,
        data.id.toString(),
        data,
      );

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
          visibility: dto.visibility,
          userID: userID,
        },
      });

      const assignedToPlayList = await this.prismaService.playListSong.create({
        data: {
          songID: data.id,
          playListID: playListID,
        },
      });

      await this.searchService.addDocument(
        ES_INDEX_NAME.song,
        data.id.toString(),
        data,
      );

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

      await this.searchService.updateDocument(
        ES_INDEX_NAME.song,
        updateData.id.toString(),
        updateData,
      );

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

    await this.findDeleteFile(dto);

    await this.searchService.deleteMultipleDocuments(
      ES_INDEX_NAME.song,
      dto.map(String),
    );

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

    await this.findDeleteFile(getSongIDs);

    const { count } = await this.prismaService.song.deleteMany({
      where: {
        id: {
          in: getSongIDs,
        },
      },
    });

    if (count !== 0) {
      await this.searchService.deleteMultipleDocuments(
        ES_INDEX_NAME.song,
        getSongIDs.map(String),
      );
    }

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

  async findDeleteFile(dto: number[]) {
    const getDataBeforeDelete = await this.prismaService.song.findMany({
      where: {
        id: {
          in: dto,
        },
      },
      select: {
        songFileName: true,
        imgFileName: true,
      },
    });

    const listOfSongFileName = getDataBeforeDelete.map(
      (item) => item.songFileName,
    );

    listOfSongFileName.forEach((item) => {
      const filePath = getSongFilePath(item);
      this.songUploadService.deleteSongFile(item, filePath);
    });

    const listOfImgFileName = getDataBeforeDelete.map(
      (item) => item.imgFileName,
    );

    listOfImgFileName.forEach((item) => {
      const filePath = getImgFilePath(item);
      this.imgUploadService.deleteImgFile(item, filePath);
    });
  }
}
