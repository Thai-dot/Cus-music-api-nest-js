import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Delete,
  UseInterceptors,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { SongService } from './song.service';
import { SongOwnerGuard } from './guard';
import { PlaylistOwnerGuard } from 'src/play-list/guard';
import { SongDto } from './dto';
import { TransformInterceptor } from 'src/interceptor/response.interceptor';
import { GetUser } from 'src/auth/decorator';
import { query } from 'express';
import { SongQueryDTO } from './dto/song-query.dto';

@Controller('song')
@UseGuards(JwtGuard)
export class SongController {
  constructor(private songService: SongService) {}

  @Get('get/:id')
  getAllSongByPlayList(@Param('id', ParseIntPipe) id: number) {
    return this.songService.getAllSongByPlayList(id);
  }

  @Get('get-all')
  getAllSongByUser(@GetUser('id') UserID: number, @Query() query:SongQueryDTO) {
    return this.songService.getAllSongByUser(UserID, query);
  }

  @Get('get-one/:songId')
  getSingleSong(@Param('songId', ParseIntPipe) songID: number) {
    return this.songService.getSingleSong(songID);
  }

  //create song with user id
  @Post('create')
  createSong(@GetUser('id') userID, @Body() dto: SongDto) {
    return this.songService.createSong(userID, dto);
  }

  //create song with play list id
  @Post('create/:id')
  @UseGuards(PlaylistOwnerGuard)
  createSongWithPlayList(
    @GetUser('id') userID,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SongDto,
  ) {
    return this.songService.createSongByPlayList(userID, id, dto);
  }

  @Patch('update/:songID')
  @UseGuards(SongOwnerGuard)
  @UseInterceptors(TransformInterceptor)
  updateSong(
    @Param('songID', ParseIntPipe) songID: number,
    @Body() dto: SongDto,
  ) {
    return this.songService.updateSong(songID, dto);
  }

  @Delete('delete')
  @UseInterceptors(TransformInterceptor)
  deleteSong(@GetUser('id') userID: number, @Body() dto: number[]) {
    return this.songService.deleteSong(userID, dto);
  }

  @Delete('delete-all/:id')
  @UseGuards(PlaylistOwnerGuard)
  @UseInterceptors(TransformInterceptor)
  deleteAllSong(@Param('id', ParseIntPipe) id: number) {
    return this.songService.deleteAll(id);
  }
}
