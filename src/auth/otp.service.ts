import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as otplib from 'otplib';

@Injectable()
export class OtpService {
  private readonly otpLength: number = 5; // Desired OTP length

  constructor(private config: ConfigService) {}

  generateOtp(): string {
    const otp = otplib.authenticator.generate(this.config.get('OTP_SECRET'));
    return otp.substring(0, this.otpLength); // Return the first 5 characters of OTP
  }

  validateOtp(inputOtp: string): boolean {
    return otplib.authenticator.check(inputOtp, this.config.get('OTP_SECRET'));
  }
}
