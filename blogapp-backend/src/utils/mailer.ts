import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
@Injectable()
export class MailService {
  transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  async mailer(email: string, otpToken: number) {
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'OTP Verification',
      html: `<div>Hi ! your OTP code is <b> ${otpToken}</b></div>`,
    });
    return true;
  }
}
