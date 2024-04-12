import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Request,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiCreatedResponse,
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserEntity } from './entities/user.entity';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enum/role.enum';
import { RolesGuard } from '../guards/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
@ApiTags('User')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Create a user by admin' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/user-image',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  async createUser(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ) {
    if (file) {
      const imageName = Date.now() + '-' + file.originalname;
      createUserDto.image = imageName;
    }
    createUserDto.created_by = req.userId;
    const createdUser = await this.usersService.createUser(createUserDto);
    return { msg: 'User created by admin', data: createdUser };
  }

  @Get('getUsers')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Get all the users' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  async findAll() {
    return await this.usersService.getAllUsers();
  }

  @Get(':id')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Get a particular user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.getaUser(+id);
    return { msg: 'user found', data: user };
  }

  @Patch('block/:id')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Block a particular user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  async blockUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.block(+id, updateUserDto);
    return { msg: 'user is blocked' };
  }

  @Delete('delete/:id')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'Delete a particular user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  async deleteUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.delete(+id, updateUserDto);
    return { msg: 'User is deleted' };
  }
}
