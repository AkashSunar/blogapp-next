import { IsInt, IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
export class CreateAuthDto {
  @IsString()
  email: string;
  @IsInt()
  @IsOptional()
  otpToken: number;
  @IsString()
  password: string;
}
export class AuthDto {
  @IsInt()
  @IsOptional()
  id: number;
  @IsString()
  email: string;
  @IsInt()
  otpToken: number;
}
export class UserVerifyDto {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsInt()
  @IsNotEmpty()
  otpToken: number;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginReturnDto {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  accessToken: string;
  @IsString()
  refreshToken: string;
}
export class ForgetPasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsInt()
  @IsOptional()
  otpToken: number;
  @IsString()
  @IsOptional()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsInt()
  @IsNotEmpty()
  otpToken: number;
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
