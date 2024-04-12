import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPassword } from '../utils/bcrypt';
import { OtpService } from '../utils/otp';
import { MailService } from '../utils/mailer';
import {
  UserVerifyDto,
  LoginDto,
  LoginReturnDto,
  ForgetPasswordDto,
  ChangePasswordDto,
} from './dto/create-auth.dto';
import { JwtService } from '../utils/jwt';

@Injectable()
export class AuthsService {
  constructor(
    private prisma: PrismaService,
    private bcrypt: BcryptPassword,
    private otpService: OtpService,
    private sendMail: MailService,
    private jwtService: JwtService,
  ) {}

  async create(signUpPayload: CreateUserDto) {
    const { name, username, email, image } = signUpPayload;
    const passwordHash = await this.bcrypt.hashPassword(signUpPayload.password);
    const newUser = {
      name,
      email,
      image,
      username,
      passwordHash,
    };
    // const generatedOTP= generateOtp()
    const generatedOTP = this.otpService.generateOtp();
    const authUser = { email: newUser.email, otpToken: +generatedOTP };
    await this.prisma.auth.create({
      data: authUser,
    });
    // await mailer(newUser.email, +generatedOTP);
    await this.sendMail.mailer(newUser.email, +generatedOTP);
    return this.prisma.user.create({ data: newUser });
  }

  async verifyUser(userAuth: UserVerifyDto): Promise<Boolean> {
    const { email, otpToken } = userAuth;
    const auth = await this.prisma.auth.findUnique({ where: { email: email } });
    if (!auth)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const IsValidToken = this.otpService.verifyOtp(String(otpToken));
    if (!IsValidToken)
      throw new HttpException('Token is expired', HttpStatus.BAD_REQUEST);
    const emailValid = auth.otpToken === otpToken;
    if (!emailValid)
      throw new HttpException('Token is mismatched', HttpStatus.BAD_REQUEST);
    await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true, isActive: true },
    });
    await this.prisma.auth.delete({
      where: { email },
    });
    return true;
  }

  async login(loginPayload: LoginDto): Promise<LoginReturnDto> {
    const { email, password } = loginPayload;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    if (!user.isEmailVerified)
      throw new HttpException(
        'User email is not verified',
        HttpStatus.BAD_REQUEST,
      );
    if (!user.isActive)
      throw new HttpException('User is not active', HttpStatus.BAD_REQUEST);
    const passwordCorrect =
      user === null
        ? false
        : await this.bcrypt.comparePassword(password, user.passwordHash);

    if (!passwordCorrect)
      throw new HttpException(
        'Email or Password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    const jwtPayload = { email: user.email, id: user.id };
    const accessToken = this.jwtService.generateJwt(jwtPayload);
    const refreshToken = this.jwtService.refreshJwt(jwtPayload);
    return { email: user.email, accessToken, refreshToken };
  }

  async forgetPasswordToken(
    forgetPasswordPayload: ForgetPasswordDto,
  ): Promise<Boolean> {
    const { email } = forgetPasswordPayload;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const otpToken = Number(this.otpService.generateOtp());
    const newUser = { email, otpToken };
    await this.prisma.auth.create({ data: newUser });
    await this.sendMail.mailer(email, otpToken);
    return true;
  }

  async changePasswordToken(
    changePasswordPayload: ForgetPasswordDto,
  ): Promise<Boolean> {
    const { email } = changePasswordPayload;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const otpToken = Number(this.otpService.generateOtp());
    const newUser = { email, otpToken };
    await this.prisma.auth.create({ data: newUser });
    await this.sendMail.mailer(email, otpToken);
    return true;
  }

  async forgetPassword(
    forgetPasswordPayload: ForgetPasswordDto,
  ): Promise<Boolean> {
    const { email, otpToken, password } = forgetPasswordPayload;
    const authUser = await this.prisma.auth.findUnique({ where: { email } });
    if (!authUser)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const IsValidToken = this.otpService.verifyOtp(String(otpToken));
    if (!IsValidToken)
      throw new HttpException('Token is expired', HttpStatus.BAD_REQUEST);
    const emailValid = authUser.otpToken === otpToken;
    if (!emailValid)
      throw new HttpException('Token is mismatched', HttpStatus.BAD_REQUEST);
    await this.prisma.user.update({
      where: { email },
      data: { passwordHash: await this.bcrypt.hashPassword(password) },
    });
    return true;
  }

  async changePassword(
    changePasswordPayload: ChangePasswordDto,
  ): Promise<Boolean> {
    const { email, otpToken, oldPassword, newPassword } = changePasswordPayload;
    const authUser = await this.prisma.auth.findUnique({ where: { email } });
    if (!authUser)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const IsValidToken = this.otpService.verifyOtp(String(otpToken));
    if (!IsValidToken)
      throw new HttpException('Token is expired', HttpStatus.BAD_REQUEST);
    const emailValid = authUser.otpToken === otpToken;
    if (!emailValid)
      throw new HttpException('Token is mismatched', HttpStatus.BAD_REQUEST);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const passwordCorrect = await this.bcrypt.comparePassword(
      oldPassword,
      user.passwordHash,
    );
    if (!passwordCorrect)
      throw new HttpException(
        'Old password you provided is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    await this.prisma.user.update({
      where: { email },
      data: { passwordHash: await this.bcrypt.hashPassword(newPassword) },
    });
    return true;
  }
}
