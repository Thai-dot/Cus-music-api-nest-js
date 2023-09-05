import { SONG_TYPE } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SongDto {
  @IsString()
  @MaxLength(100)
  @MinLength(2)
  songName: string;

  @IsString()
  @IsOptional()
  songFileName?: string;

  @IsNumber()
  @Max(100)
  @Type(() => Number)
  size = 0.1;

  @IsString()
  @IsOptional()
  extension: string;

  @IsString()
  @IsEnum(SONG_TYPE)
  @IsOptional()
  type: SONG_TYPE;

  @IsString()
  @IsOptional()
  imgURL: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  likes = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  dislikes = 0;
}
