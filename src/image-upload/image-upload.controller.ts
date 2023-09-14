import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from 'src/auth/guard';
import { v4 as uuid } from 'uuid';

import * as path from 'path';
import { ImageUploadService } from './image-upload.service';
import { getImgFilePath } from 'src/constant/file-path.constant';

@UseGuards(JwtGuard)
@Controller('image-upload')
export class ImageUploadController {
  constructor(
    private config: ConfigService,
    private imgUploadService: ImageUploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpeg|gif|png|avif|webp|svg+xml)$/)) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              `Unsupported file type ${extname(file.originalname)}`,
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: path.join(__dirname, '../../uploads/image'),
        filename: (req, file, callback) => {
          return callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: '.(jpeg|gif|png|avif|webp|svg+xml)',
          }),
          new MaxFileSizeValidator({ maxSize: 8000000 }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    const pathInfo = path.relative(process.cwd(), file.path).split('\\');
    return this.imgUploadService.createFileUploadInformation(
      pathInfo,
      file.size,
      file.mimetype,
    );
  }

  @Delete('delete/:filename')
  deleteFile(@Param('filename') filename: string) {
    const filePath = getImgFilePath(filename);
    return this.imgUploadService.deleteImgFile(filename, filePath);
  }
}
