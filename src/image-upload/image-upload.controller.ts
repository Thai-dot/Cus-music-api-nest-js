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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { v4 as uuid } from 'uuid';

@UseGuards(JwtGuard)
@Controller('image-upload')
export class ImageUploadController {
  constructor(private config: ConfigService) {}

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
        destination: './uploads/image',
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
    @GetUser('id') userID: number,
  ) {
    const url = `${this.config.get('BASE_URL')}/${file.path
      .split('\\')
      .join('/')}`;
    return { url };
  }
}
