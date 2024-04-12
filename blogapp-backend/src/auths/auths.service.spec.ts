import { Test, TestingModule } from '@nestjs/testing';
import { AuthsService } from './auths.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPassword } from '../utils/bcrypt';
import { JwtService } from '../utils/jwt';
import { OtpService } from '../utils/otp';
import { MailService } from '../utils/mailer';
import { Role } from '../enum/role.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  AuthDto,
  ChangePasswordDto,
  ForgetPasswordDto,
} from './dto/create-auth.dto';

const userData = {
  name: 'Akash Sunar',
  username: 'Aakhu',
  email: 'aakhu@test.com',
  image: '1708922438402-DSCN9313.JPG',
  password: '11111111',
};
const signedupUser = {
  id: 1,
  name: 'Akash Suar',
  username: 'Aakhu',
  email: 'aakhu@test.com',
  passwordHash: 'hashedPassword',
  isEmailVerified: false,
  isActive: false,
  isArchive: false,
  role: 'USER' as Role,
  image: '1708922438402-DSCN9314.JPG',
  created_by: 0,
  updated_by: 0,
};
const authUser = {
  email: 'aakhu@test.com',
  otpToken: 123456,
};

const loginData = {
  email: 'aakhu@test.com',
  password: '123456789',
};
const loggedinUser = {
  id: 1,
  name: 'Akash Suar',
  username: 'Aakhu',
  email: 'aakhu@test.com',
  passwordHash: 'hashedPassword',
  isEmailVerified: true,
  isActive: true,
  isArchive: false,
  role: 'USER' as Role,
  image: '1708922438402-DSCN9314.JPG',
  created_by: 0,
  updated_by: 0,
};
const accessToken = 'access-token';
const refreshToken = 'refresh-token';

const notVerifiedUser = {
  id: 5,
  name: 'Akash Suar',
  username: 'Aakhu',
  email: 'aakhu@test.com',
  passwordHash: 'hashedPassword',
  isEmailVerified: false,
  isActive: true,
  isArchive: false,
  role: 'USER' as Role,
  image: '1708922438402-DSCN9314.JPG',
  created_by: 0,
  updated_by: 0,
};
const notActiveUser = {
  id: 5,
  name: 'Akash Suar',
  username: 'Aakhu',
  email: 'aakhu@test.com',
  passwordHash: 'hashedPassword',
  isEmailVerified: true,
  isActive: false,
  isArchive: false,
  role: 'USER' as Role,
  image: '1708922438402-DSCN9314.JPG',
  created_by: 0,
  updated_by: 0,
};
const forgotPasswordPayload = {
  email: 'aakhu@test.com',
  otpToken: 123456,
  password: 'newPassword',
};
const changePasswordPayload = {
  email: 'aakhu@test.com',
  otpToken: 123456,
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
};

describe('AuthsService', () => {
  let service: AuthsService;
  let prisma: PrismaService;
  let bcrypt: BcryptPassword;
  let jwtService: JwtService;
  let otpService: OtpService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        PrismaService,
        BcryptPassword,
        OtpService,
        MailService,
        JwtService,
      ],
    }).compile();

    service = module.get<AuthsService>(AuthsService);
    prisma = module.get<PrismaService>(PrismaService);
    bcrypt = module.get<BcryptPassword>(BcryptPassword);
    jwtService = module.get<JwtService>(JwtService);
    otpService = module.get<OtpService>(OtpService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User sign up', () => {
    it('should signed up a user', async () => {
      jest
        .spyOn(BcryptPassword.prototype, 'hashPassword')
        .mockResolvedValue('hashedPassword');
      jest.spyOn(MailService.prototype, 'mailer').mockResolvedValue(true);
      jest.spyOn(OtpService.prototype, 'generateOtp').mockReturnValue('123456');
      jest.spyOn(prisma.user, 'create').mockResolvedValue(signedupUser);
      jest.spyOn(prisma.auth, 'create').mockResolvedValue(authUser as AuthDto);
      const result = await service.create(userData as CreateUserDto);
      expect(result).toEqual(signedupUser);
      expect(mailService.mailer).toHaveBeenCalledWith('aakhu@test.com', 123456);
      expect(bcrypt.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(otpService.generateOtp).toHaveBeenCalled();
    });
  });

  describe('Verify the user', () => {
    it('should verify the user', async () => {
      jest
        .spyOn(prisma.auth, 'findUnique')
        .mockResolvedValue(authUser as AuthDto);
      jest.spyOn(prisma.auth, 'delete').mockResolvedValue(authUser as AuthDto);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(true);
      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue({ isEmailVerified: true } as any);
      const result = await service.verifyUser(authUser);
      expect(result).toBe(true);
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: authUser.email,
        },
      });
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(prisma.auth, 'findUnique').mockResolvedValue(null);
      const result = service.verifyUser(authUser);
      await expect(result).rejects.toThrow('User is not available');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: authUser.email,
        },
      });
    });

    it('should throw an error if otpToken is expired', async () => {
      jest
        .spyOn(prisma.auth, 'findUnique')
        .mockResolvedValue(authUser as AuthDto);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(false);
      const result = service.verifyUser(authUser);
      expect(result).rejects.toThrow('Token is expired');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: authUser.email,
        },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
    });

    it('should throw an error if token is mismatched', async () => {
      jest.spyOn(prisma.auth, 'findUnique').mockResolvedValue({
        email: 'aakhu@test.com',
        otpToken: 111111,
      } as AuthDto);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(true);
      const result = service.verifyUser(authUser as AuthDto);
      expect(result).rejects.toThrow('Token is mismatched');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: authUser.email,
        },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
    });
  });

  describe('User login testing', () => {
    it('should make user login and give JWT token', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(loggedinUser);
      jest
        .spyOn(BcryptPassword.prototype, 'comparePassword')
        .mockResolvedValue(true);
      jest
        .spyOn(JwtService.prototype, 'generateJwt')
        .mockReturnValue(accessToken as never);
      jest
        .spyOn(JwtService.prototype, 'refreshJwt')
        .mockReturnValue(refreshToken as never);

      const result = await service.login(loginData);
      expect(result).toEqual({
        email: loginData.email,
        accessToken,
        refreshToken,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(
        loginData.password,
        loggedinUser.passwordHash,
      );
      expect(jwtService.generateJwt).toHaveBeenCalled();
      expect(jwtService.refreshJwt).toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const result = service.login(loginData);
      await expect(result).rejects.toThrow('User is not available');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
    });

    it('should throw an error if email is not verified', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(notVerifiedUser);
      const result = service.login(loginData);
      await expect(result).rejects.toThrow('User email is not verified');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
    });
    it('should throw an error if user is not active', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(notActiveUser);
      const result = service.login(loginData);
      await expect(result).rejects.toThrow('User is not active');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
    });

    it('should throw error if invalid email or password is provided ', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(loggedinUser);
      jest
        .spyOn(BcryptPassword.prototype, 'comparePassword')
        .mockResolvedValue(false as never);
      const result = service.login(loginData);
      await expect(result).rejects.toThrow('Email or Password is incorrect');
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(
        loginData.password,
        loggedinUser.passwordHash,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
    });
  });

  describe('Generate  forgotpassword token', () => {
    it('should generate forgotPassword token', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(loggedinUser);
      jest.spyOn(OtpService.prototype, 'generateOtp').mockReturnValue('123456');
      jest.spyOn(MailService.prototype, 'mailer').mockResolvedValue(true);
      jest.spyOn(prisma.auth, 'create').mockResolvedValue(authUser as AuthDto);
      const result = await service.forgetPasswordToken(
        loginData as ForgetPasswordDto,
      );
      expect(result).toBe(true);
      expect(otpService.generateOtp()).toEqual('123456');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
      expect(prisma.auth.create).toHaveBeenCalledWith({
        data: authUser,
      });
      expect(otpService.generateOtp).toHaveBeenCalled();
      expect(mailService.mailer).toHaveBeenCalledWith(loginData.email, 123456);
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const result = service.login(loginData);
      await expect(result).rejects.toThrow('User is not available');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
    });
  });

  describe('Forgot passward testing', () => {
    it('should set new password in case of forgetting password', async () => {
      jest
        .spyOn(prisma.auth, 'findUnique')
        .mockResolvedValue(authUser as AuthDto);
      jest
        .spyOn(BcryptPassword.prototype, 'hashPassword')
        .mockResolvedValue('newHashedPassword');
      jest.spyOn(prisma.user, 'update').mockResolvedValue(loggedinUser);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(true);
      const result = await service.forgetPassword(forgotPasswordPayload);
      expect(result).toBe(true);
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: forgotPasswordPayload.email,
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: forgotPasswordPayload.email },
        data: { passwordHash: 'newHashedPassword' },
      });
      expect(bcrypt.hashPassword).toHaveBeenCalledWith(
        forgotPasswordPayload.password,
      );
      expect(otpService.verifyOtp).toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(prisma.auth, 'findUnique').mockResolvedValue(null);
      const result = service.forgetPassword(forgotPasswordPayload);
      await expect(result).rejects.toThrow('User is not available');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: forgotPasswordPayload.email,
        },
      });
    });

    it('should throw an error if otpToken is expired', async () => {
      jest
        .spyOn(prisma.auth, 'findUnique')
        .mockResolvedValue(authUser as AuthDto);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(false);
      const result = service.forgetPassword(forgotPasswordPayload);
      expect(result).rejects.toThrow('Token is expired');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: forgotPasswordPayload.email,
        },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
    });

    it('should throw an error if token is mismatched', async () => {
      jest.spyOn(prisma.auth, 'findUnique').mockResolvedValue({
        email: 'aakhu@test.com',
        otpToken: 111111,
      } as AuthDto);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(true);
      const result = service.forgetPassword(forgotPasswordPayload);
      expect(result).rejects.toThrow('Token is mismatched');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: forgotPasswordPayload.email,
        },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
    });
  });

  describe('Change changepassword token', () => {
    it('should generate change password token', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(loggedinUser);
      jest.spyOn(OtpService.prototype, 'generateOtp').mockReturnValue('123456');
      jest.spyOn(prisma.auth, 'create').mockResolvedValue(authUser as AuthDto);
      jest.spyOn(MailService.prototype, 'mailer').mockResolvedValue(true);
      const result = await service.changePasswordToken(
        loginData as ForgetPasswordDto,
      );
      expect(result).toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: authUser.email },
      });
      expect(otpService.generateOtp()).toEqual('123456');
      expect(prisma.auth.create).toHaveBeenCalledWith({
        data: authUser,
      });
      expect(mailService.mailer).toHaveBeenCalledWith(authUser.email, 123456);
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const result = service.changePasswordToken(
        loginData as ForgetPasswordDto,
      );
      await expect(result).rejects.toThrow('User is not available');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: loginData.email,
        },
      });
    });
  });

  describe(' Change password testing', () => {
    it('should handle change password', async () => {
      jest
        .spyOn(prisma.auth, 'findUnique')
        .mockResolvedValue(authUser as AuthDto);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(loggedinUser);
      jest
        .spyOn(BcryptPassword.prototype, 'comparePassword')
        .mockResolvedValue(true as never);

      jest
        .spyOn(BcryptPassword.prototype, 'hashPassword')
        .mockResolvedValue('newHashedPassword' as never);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(true);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(loggedinUser);
      const result = await service.changePassword(
        changePasswordPayload as ChangePasswordDto,
      );
      expect(result).toBe(true);
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: { email: changePasswordPayload.email },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: changePasswordPayload.email },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          email: changePasswordPayload.email,
        },
        data: {
          passwordHash: 'newHashedPassword',
        },
      });
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(
        changePasswordPayload.oldPassword,
        'hashedPassword',
      );
      expect(bcrypt.hashPassword).toHaveBeenCalledWith(
        changePasswordPayload.newPassword,
      );
    });

    it("should throw error  if auth user doesn't exist", async () => {
      jest.spyOn(prisma.auth, 'findUnique').mockResolvedValue(null);
      const result = service.changePassword(changePasswordPayload);
      await expect(result).rejects.toThrow('User is not available');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: { email: changePasswordPayload.email },
      });
    });

    it('should throw error if provided token is not valid', async () => {
      jest
        .spyOn(prisma.auth, 'findUnique')
        .mockResolvedValue(authUser as AuthDto);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(false);
      const result = service.changePassword(changePasswordPayload);
      await expect(result).rejects.toThrow('Token is expired');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: { email: changePasswordPayload.email },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
    });

    it('should throw an error if token is mismatched', async () => {
      jest.spyOn(prisma.auth, 'findUnique').mockResolvedValue({
        email: 'aakhu@test.com',
        otpToken: 111111,
      } as AuthDto);
      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(true);
      const result = service.changePassword(changePasswordPayload);
      expect(result).rejects.toThrow('Token is mismatched');
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: {
          email: changePasswordPayload.email,
        },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
    });
    it('should throw an error if old password is incorrect', async () => {
      jest
        .spyOn(prisma.auth, 'findUnique')
        .mockResolvedValue(authUser as AuthDto);

      jest.spyOn(OtpService.prototype, 'verifyOtp').mockReturnValue(true);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(loggedinUser);
      jest
        .spyOn(BcryptPassword.prototype, 'comparePassword')
        .mockResolvedValue(false as never);
      const result = service.changePassword(changePasswordPayload);
      await expect(result).rejects.toThrow(
        'Old password you provided is incorrect',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: changePasswordPayload.email },
      });
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: { email: changePasswordPayload.email },
      });
      expect(bcrypt.comparePassword).toHaveBeenCalledWith(
        changePasswordPayload.oldPassword,
        'hashedPassword',
      );
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        String(authUser.otpToken),
      );
    });
  });
});
