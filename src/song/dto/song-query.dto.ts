import { SONG_TYPE } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class SongQueryDTO {
  @IsString()
  @IsOptional()
  songName: string;

  @IsEnum(SONG_TYPE)
  @IsOptional()
  type: SONG_TYPE;

  @IsInt()
  @Max(100)
  @Type(() => Number)
  limit = 5;

  @IsInt()
  @Type(() => Number)
  page = 1;

  @IsOptional()
  visibility: boolean;
}
