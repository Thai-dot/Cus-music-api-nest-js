import * as path from 'path';

export const getSongFilePath = (filename: string) =>
  path.join(__dirname, '../../uploads/music', filename);

export const getImgFilePath = (filename: string) =>
  path.join(__dirname, '../../uploads/image', filename);
