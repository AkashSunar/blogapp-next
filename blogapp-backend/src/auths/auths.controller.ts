import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Request,
  Response,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  UserVerifyDto,
  LoginDto,
  ForgetPasswordDto,
  ChangePasswordDto,
} from './dto/create-auth.dto';
import { AuthsService } from './auths.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { AuthEntity } from './entities/auth.entity';

@Controller('auths')
@ApiTags('Auth')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('signup')
  @ApiCreatedResponse({ type: UserEntity })
  @ApiOperation({ summary: 'User Sign up' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: [UserEntity],
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/auth-image',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async signUp(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ) {
    if (file) {
      const imageName = Date.now() + '-' + file.originalname;
      createUserDto.image = imageName;
    }
    // const signedUpUser=await this.authsService.create()
    return this.authsService.create(createUserDto);
  }

  @Post('verifyUser')
  @ApiOperation({ summary: 'User verify' })
  @ApiResponse({
    status: 200,
    description: 'verification of user',
    type: [AuthEntity],
  })
  async verify(@Body() createAuthDto: UserVerifyDto, @Request() req: any) {
    return this.authsService.verifyUser(createAuthDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: 200,
    description: 'Login of user',
    type: [AuthEntity],
  })
  async login(
    @Body() loginAuthDto: LoginDto,
    @Response() res: any,
  ) {
    const result = await this.authsService.login(loginAuthDto);
    const { refreshToken } = result;
    res.cookie('refreshToken', refreshToken);
    // return result;
    return res
      .status(200)
      .json({ data: result, msg: 'successfully logged in' });
  }

  @Post('FPtoken')
  @ApiOperation({ summary: 'Forget Password Token' })
  @ApiResponse({
    status: 200,
    description: 'Forget Password',
    type: [AuthEntity],
  })
  async forgetPasswordToken(@Body() forgetPasswordPayload: ForgetPasswordDto) {
    return await this.authsService.forgetPasswordToken(forgetPasswordPayload);
  }

  @Post('CPtoken')
  @ApiOperation({ summary: 'Change Password Token' })
  @ApiResponse({
    status: 200,
    description: 'Change Password',
    type: [AuthEntity],
  })
  async changePasswordToken(@Body() changePasswordPayload: ForgetPasswordDto) {
    try {
      return await this.authsService.changePasswordToken(changePasswordPayload);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'This error is related to auth creation',
        },
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }

  @Post('forgetPassword')
  @ApiOperation({ summary: 'Forgot Password' })
  @ApiResponse({
    status: 200,
    description: 'Forgot Password',
    type: [AuthEntity],
  })
  async forgetPassword(@Body() forgetPasswordPayload: ForgetPasswordDto) {
    return this.authsService.forgetPassword(forgetPasswordPayload);
  }

  @Post('changePassword')
  @ApiOperation({ summary: 'Change Password' })
  @ApiResponse({
    status: 200,
    description: 'Change Password',
    type: [AuthEntity],
  })
  async changePassword(@Body() changePasswordPayload: ChangePasswordDto) {
    return this.authsService.changePassword(changePasswordPayload);
  }
}
