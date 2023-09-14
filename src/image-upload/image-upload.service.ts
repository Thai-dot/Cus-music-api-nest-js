import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class ImageUploadService {
  constructor(private config: ConfigService) {}

  createFileUploadInformation(
    pathInfo: string[],
    fileSize: number,
    mimetype: string,
  ) {
    const relativePath = pathInfo.join('/');
    const fileName = relativePath.split('/').at(-1);
    const extension = relativePath.split('.')[1];
    const url = `${this.config.get('BASE_URL')}/${relativePath}`;
    return { url, relativePath, fileName, extension, fileSize, mimetype };
  }

  deleteImgFile(filename: string, filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        return `File ${filename} not found`;
      }
    });
    return { message: `File ${filename} has been deleted` };
  }
}
