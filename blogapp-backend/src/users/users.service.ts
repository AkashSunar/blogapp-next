import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPassword } from '../utils/bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private bcrypt: BcryptPassword,
  ) { }
  async createUser(
    signUpPayload: CreateUserDto,
  ): Promise<Prisma.UserCreateInput> {
    const { name, username, email, image, created_by } = signUpPayload;
    const passwordHash = await this.bcrypt.hashPassword(signUpPayload.password);
    const newUser = {
      name,
      email,
      image,
      username,
      isActive: true,
      isArchive: false,
      isEmailVerified: true,
      passwordHash,
      created_by,
    };
    return await this.prisma.user.create({ data: newUser});
  }

  async getAllUsers() {
    return await this.prisma.user.findMany({});
  }

  async getaUser(id: number) {
    return await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });
  }

  async block(id: number, blockPayload: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

    if (!user.isActive)
      throw new HttpException(
        'User is already blocked',
        HttpStatus.BAD_REQUEST,
      );
    return await this.prisma.user.update({
      where: { id },
      data: blockPayload,
    });
  }
  
  async delete(id: number, deletePayLoad: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    if (user.isArchive)
      throw new HttpException(
        'User is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    return await this.prisma.user.update({
      where: { id },
      data: deletePayLoad,
    });
  }
}
