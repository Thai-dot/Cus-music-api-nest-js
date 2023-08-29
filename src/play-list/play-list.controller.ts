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
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { PlayListDto, QueryGetAllPlayList } from './dto';
import { TransformInterceptor } from 'src/interceptor/response.interceptor';

@UseGuards(JwtGuard)
@Controller('play-list')
export class PlayListController {
  constructor(private playListService: PlayListService) {}

  @Get('get')
  getAllPlayList(
    @GetUser('id') userID: number,
    @Query() query: QueryGetAllPlayList,
  ) {
    return this.playListService.getPlayListByUser(userID, query);
  }

  @Get('/get/:id')
  getOnePlayList(
    @Param('id', ParseIntPipe) playListID: number,
    @GetUser('id') userID: number,
  ) {
    return this.playListService.getOnePlayList(playListID, userID);
  }

  @Post('create')
  createPlayList(@GetUser('id') userID: number, @Body() dto: PlayListDto) {
    return this.playListService.createPlayList(userID, dto);
  }

  @Patch('/update/:id')
  updatePlayList(
    @Param('id', ParseIntPipe) playListID: number,
    @GetUser('id') userID: number,
    @Body() dto: PlayListDto,
  ) {
    return this.playListService.updatePlayList(playListID, userID, dto);
  }

  @Delete('delete')
  @UseInterceptors(TransformInterceptor)
  deletePlayList(@GetUser('id') userID: number, @Body() dto: number[]) {
    return this.playListService.deletePlayLists(userID, dto);
  }
}
