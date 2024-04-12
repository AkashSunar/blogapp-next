import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BcryptPassword } from '../utils/bcrypt';
import { JwtService } from '../utils/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BcryptPassword, JwtService,PrismaService],
  imports: [PrismaModule],
})
export class UsersModule {}
