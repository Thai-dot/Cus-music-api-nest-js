import { PlayListType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

enum SortType {
  Asc = 'asc',
  Desc = 'desc',
}

enum SortBy {
  Name = 'name',
  Date = 'updateAt',
  Type = 'type',
}

export class QueryGetAllPlayList {
  @IsString()
  @MaxLength(120)
  searchName = '';

  @IsInt()
  @Max(100)
  @Type(() => Number)
  limit = 5;

  @IsInt()
  @Type(() => Number)
  page = 1;

  @IsEnum(SortType)
  sortType = SortType.Asc;

  @IsEnum(SortBy)
  sortBy = SortBy.Name;

  @IsEnum(PlayListType)
  @IsOptional()
  type: PlayListType;

  @IsOptional()
  visibility: boolean;
}
