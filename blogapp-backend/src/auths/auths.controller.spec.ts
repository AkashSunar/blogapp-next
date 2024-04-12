import { Test, TestingModule } from '@nestjs/testing';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPassword } from '../utils/bcrypt';
import { JwtService } from '../utils/jwt';
import { MailService } from '../utils/mailer';
import { OtpService } from '../utils/otp';

describe('AuthsController', () => {
  let controller: AuthsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthsController],
      providers: [
        AuthsService,
        PrismaService,
        BcryptPassword,
        JwtService,
        MailService,
        OtpService,
      ],
    }).compile();

    controller = module.get<AuthsController>(AuthsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
