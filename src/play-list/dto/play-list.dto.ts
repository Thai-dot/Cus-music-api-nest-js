import { PlayListType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PlayListDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  @IsEnum(PlayListType)
  type?: PlayListType;

  @IsBoolean()
  @IsOptional()
  visibility = false;

  @IsString()
  @IsOptional()
  imgURL?: string;

  @IsString()
  @IsOptional()
  imgName?: string;
}

export class ReorderMap {
  @IsNumber()
  songID: number;

  @IsNumber()
  order: number;
}
