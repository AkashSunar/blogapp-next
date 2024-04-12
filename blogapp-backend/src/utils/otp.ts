import { totp } from 'otplib';
import { Injectable } from '@nestjs/common'; // load and access environment variables

@Injectable()
export class OtpService {
  generateOtp() {
    totp.options = { digits: 6, step: 300 };
    return totp.generate(process.env.OTP_SECRET);
  }
  verifyOtp(otpToken: string) {
    totp.options = { digits: 6, step: 300 };
    // console.log(totp.check(otpToken, process.env.OTP_SECRET), 'from otp');
    return totp.check(otpToken, process.env.OTP_SECRET);
  }
}
