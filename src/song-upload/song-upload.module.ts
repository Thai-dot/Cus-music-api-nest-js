import { Global, Module } from '@nestjs/common';

import { SongUploadController } from './song-upload.controller';
import { SongUploadService } from './song-upload.service';

@Global()
@Module({
  controllers: [SongUploadController],
  providers: [SongUploadService],
  exports: [SongUploadService],
})
export class SongUploadModule {}
