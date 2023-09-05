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
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { SongService } from './song.service';
import { SongOwnerGuard } from './guard';
import { PlaylistOwnerGuard } from 'src/play-list/guard';
import { SongDto } from './dto';
import { TransformInterceptor } from 'src/interceptor/response.interceptor';
import { GetUser } from 'src/auth/decorator';

@Controller('song')
@UseGuards(JwtGuard)
export class SongController {
  constructor(private songService: SongService) {}

  @Get('get/:id')
  getAllSongByPlayList(@Param('id', ParseIntPipe) id: number) {
    return this.songService.getAllSongByPlayList(id);
  }

  @Get('get-all')
  getAllSongByUser(@GetUser('id') UserID: number) {
    return;
  }

  @Get('get-one/:songId')
  getSingleSong(@Param('songId', ParseIntPipe) songID: number) {
    return this.songService.getSingleSong(songID);
  }

  //create song without playlist id
  @Post('create')
  createSong(@Body() dto: SongDto) {
    return this.songService.createSong(null, dto);
  }

  //create song with playlist id
  @Post('create')
  @UseGuards(PlaylistOwnerGuard)
  createSongWithPlayListID(@GetUser('id') userID, @Body() dto: SongDto) {
    return this.songService.createSong(userID, dto);
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
