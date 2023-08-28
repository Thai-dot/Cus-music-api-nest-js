import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  @MaxLength(180)
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(32)
  password: string;

  @IsString()
  @MaxLength(20)
  firstname: string;

  @MaxLength(20)
  @IsString()
  lastName: string;
}
