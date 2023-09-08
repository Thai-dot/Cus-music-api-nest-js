import { OtpService } from './otp.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { AuthDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { sendVerificationEmail } from './email.service';

@Injectable()
export class AuthService {
  private temporaryCodes = '';
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otpService: OtpService,
  ) {}

  async createUser(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);

      const newUser = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: hash,
          firstname: dto.firstname,
          lastName: dto.lastName,
        },
      });

      return this.signToken(newUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async send2FACodeToEmail(email: string) {
    const code = this.otpService.generateOtp();
    this.temporaryCodes = code;

    return await sendVerificationEmail(email, code);
  }

  async verify2FACode(email: string, code: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user && code === this.temporaryCodes) {
      this.temporaryCodes = '';
      return this.signToken(user);
    }

    // Code is invalid
    return new UnauthorizedException();
  }

  async login(dto: LoginDto) {
    try {
      const findUser = await this.prismaService.user.findFirst({
        where: {
          email: dto.email,
        },
      });

      if (!findUser) return new NotFoundException();

      const verify = await argon.verify(findUser.password, dto.password);

      if (!verify) return new ForbiddenException();

      await this.send2FACodeToEmail(findUser.email);

      // should remove token from here. For the sake of testing, still not remove this line of code yet
      return this.signToken(findUser);
    } catch (error) {
      throw error;
    }
  }

  async signToken(user: User): Promise<{ access_token: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '220m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async deleteDB() {
    try {
      this.prismaService.cleanDb();
      return {
        message: 'deleted db successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
