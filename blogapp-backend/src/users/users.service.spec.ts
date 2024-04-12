import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPassword } from '../utils/bcrypt';
import { JwtService } from '../utils/jwt';
import { Role } from 'src/enum/role.enum';
import { CreateUserDto } from './dto/create-user.dto';

const testUser = [
  {
    id: 3,
    name: 'Akash Sunar',
    username: 'Aakhu',
    email: 'aakhu@test.com',
    passwordHash: 'hashedPassword',
    isEmailVerified: true,
    isActive: true,
    isArchive: false,
    role: 'USER' as Role,
    image: '1708922438402-DSCN9314.JPG',
    created_by: 1,
    updated_by: 0,
  },
];
const blockingPayload = { isActive: false };

const blockedUser = {
  id: 5,
  name: 'Akash Sunar',
  username: 'Aakhu',
  email: 'aakhu@test.com',
  passwordHash: 'hashedPassword',
  isEmailVerified: true,
  isActive: false,
  isArchive: false,
  role: 'USER' as Role,
  image: '1708922438402-DSCN9314.JPG',
  created_by: 1,
  updated_by: 0,
};

const deletingPayload = { isArchive: true };

const deletedUser = {
  id: 3,
  name: 'Akash Sunar',
  username: 'Aakhu',
  email: 'aakhu@test.com',
  passwordHash: 'hashedPassword',
  isEmailVerified: true,
  isActive: true,
  isArchive: true,
  role: 'USER' as Role,
  image: '1708922438402-DSCN9314.JPG',
  created_by: 1,
  updated_by: 0,
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let bcrypt: BcryptPassword;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService, BcryptPassword, JwtService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    bcrypt = module.get<BcryptPassword>(BcryptPassword);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('', () => {
  //   it('', () => {});
  // });

  describe('Create a user by admin', () => {
    it('should create a user by admin', async () => {
      const userData = {
        name: 'Akash Sunar',
        username: 'Aakhu',
        email: 'aakhu@test.com',
        image: '1708922438402-DSCN9313.JPG',
        password: '11111111',
      };
      jest
        .spyOn(BcryptPassword.prototype, 'hashPassword')
        .mockResolvedValue('hashedPassword');
      jest.spyOn(prisma.user, 'create').mockResolvedValue(testUser[0]);
      const createdUser = await service.createUser(userData as CreateUserDto);
      expect(createdUser).toEqual(testUser[0]);
      expect(bcrypt.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Akash Sunar',
          username: 'Aakhu',
          email: 'aakhu@test.com',
          image: '1708922438402-DSCN9313.JPG',
          passwordHash: 'hashedPassword',
          isEmailVerified: true,
          isActive: true,
          isArchive: false,
        },
      });
    });
  });

  describe('Get all users', () => {
    it('should return all the user', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(testUser);
      const allBlogs = await service.getAllUsers();
      expect(allBlogs).toEqual(testUser);
      expect(prisma.user.findMany).toHaveBeenCalled()
    });
  });

  describe('Block the user', () => {
    it('Should block the user that the admin want', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValue(blockedUser);
      const result = await service.block(testUser[0].id, blockingPayload);
      expect(result).toEqual(blockedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUser[0].id },
        data: blockingPayload,
      });
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const result = service.block(testUser[0].id, blockingPayload);
      await expect(result).rejects.toThrow('User not found');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser[0].id },
      });
    });

    it('should throw an error if user is already blocked', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(blockedUser);
      const result = service.block(testUser[0].id, blockingPayload);
      await expect(result).rejects.toThrow('User is already blocked');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser[0].id },
      });
    });
  });

  describe('Delete a user', () => {
    it('Should delete the user that the admin want', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValue(deletedUser);
      const result = await service.delete(testUser[0].id, deletingPayload);
      expect(result).toEqual(deletedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUser[0].id },
        data: deletingPayload,
      });
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const result = service.delete(testUser[0].id, deletingPayload);
      await expect(result).rejects.toThrow('User not found');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser[0].id },
      });
    });

    it('should throw an error if user is already deleted', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(deletedUser);
      const result = service.delete(testUser[0].id, deletingPayload);
      await expect(result).rejects.toThrow('User is already deleted');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUser[0].id },
      });
    });
  });
});
