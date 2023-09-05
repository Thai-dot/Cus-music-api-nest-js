import { Module } from '@nestjs/common';

import { SongUploadController } from './song-upload.controller';

@Module({
  controllers: [SongUploadController],
})
export class SongUploadModule {}
