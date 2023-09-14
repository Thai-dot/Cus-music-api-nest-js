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
import { SongUploadService } from './song-upload.service';
import { getSongFilePath } from 'src/constant/file-path.constant';

@UseGuards(JwtGuard)
@Controller('song-upload')
export class SongUploadController {
  constructor(
    private config: ConfigService,
    private songUploadService: SongUploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(basic|mpeg|mid|x-mpegurl|x-wav)$/)) {
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
        destination: path.join(__dirname, '../../uploads/music'),
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
          new FileTypeValidator({ fileType: '.(basic|mpeg|x-mpegurl|x-wav)' }),
          new MaxFileSizeValidator({ maxSize: 22000000 }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    const pathInfo = path.relative(process.cwd(), file.path).split('\\');
    return this.songUploadService.createSongUploadInformation(
      pathInfo,
      file.size,
      file.mimetype,
    );
  }

  @Delete('delete/:filename')
  deleteFile(@Param('filename') filename: string) {
    const filePath = getSongFilePath(filename);
    return this.songUploadService.deleteSongFile(filename, filePath);
  }
}
