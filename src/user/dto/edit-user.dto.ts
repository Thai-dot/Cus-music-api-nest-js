import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class EditUser {
  @IsString()
  @MaxLength(20)
  @MinLength(3)
  @IsOptional()
  firstname?: string;

  @IsString()
  @MaxLength(20)
  @MinLength(3)
  @IsOptional()
  lastName?: string;
}
