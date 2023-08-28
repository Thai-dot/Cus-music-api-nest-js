import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('play-list')
export class PlayListController {

    @Post("create")
    createPlayList(){
        
    }

}
