import { PlayListService } from './play-list.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
  ParseArrayPipe,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { PlayListDto, QueryGetAllPlayList } from './dto';
import { TransformInterceptor } from 'src/interceptor/response.interceptor';
import { PlaylistOwnerGuard } from './guard';

@UseGuards(JwtGuard)
@Controller('play-list')
export class PlayListController {
  constructor(private _playListService: PlayListService) {}

  @Get('get-all')
  getAll(@Query() query: QueryGetAllPlayList) {
    return this._playListService.getAllPlayList(query);
  }

  @Get('get')
  getAllPlayList(
    @GetUser('id') userID: number,
    @Query() query: QueryGetAllPlayList,
  ) {
    return this._playListService.getPlayListByUser(userID, query);
  }

  @Get('/get/:id')
  getOnePlayList(
    @Param('id', ParseIntPipe) playListID: number,
    @GetUser('id') userID: number,
  ) {
    return this._playListService.getOnePlayList(playListID, userID);
  }

  @Post('create')
  createPlayList(@GetUser('id') userID: number, @Body() dto: PlayListDto) {
    return this._playListService.createPlayList(userID, dto);
  }

  @Patch('/update/:id')
  updatePlayList(
    @Param('id', ParseIntPipe) playListID: number,
    @GetUser('id') userID: number,
    @Body() dto: PlayListDto,
  ) {
    return this._playListService.updatePlayList(playListID, userID, dto);
  }

  @UseGuards(PlaylistOwnerGuard)
  @Patch('/assign-song/:id')
  assignSongToPlayList(
    @Param('id', ParseIntPipe) playListID: number,
    @Body(new ParseArrayPipe()) dto: number[],
  ) {
    return this._playListService.assignSongToPlayList(playListID, dto);
  }

  @UseGuards(PlaylistOwnerGuard)
  @Delete('unassigned-song/:id')
  unassignedSongFromPlayList(
    @Param('id', ParseIntPipe) playListID: number,
    @Body(new ParseArrayPipe()) dto: number[],
  ) {
    return this._playListService.unassignedSongFromPlayList(playListID, dto);
  }

  @Delete('delete')
  @UseInterceptors(TransformInterceptor)
  deletePlayList(@GetUser('id') userID: number, @Body() dto: number[]) {
    return this._playListService.deletePlayLists(userID, dto);
  }
}
