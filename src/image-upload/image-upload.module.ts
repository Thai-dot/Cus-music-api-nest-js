import { Global, Module } from '@nestjs/common';
import { ImageUploadController } from './image-upload.controller';
import { ImageUploadService } from './image-upload.service';

@Global()
@Module({
  controllers: [ImageUploadController],
  providers: [ImageUploadService],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
