import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.createUser(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-2fa')
  verify2FA(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.verify2FACode(email, code);
  }

  @Delete('delete-db')
  deleteDB() {
    return this.authService.deleteDB();
  }
}
