import { $Enums } from '@prisma/client';
import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsString()
  username: string;
  @IsString()
  email: string;
  @IsOptional()
  image: string;
  @IsString()
  @IsOptional()
  role: $Enums.Role;
  @IsInt()
  @IsOptional()
  created_by: number;
  @IsInt()
  @IsOptional()
  updated_by: number;
  @IsString()
  @IsOptional()
  passwordHash: string;
  @IsString()
  @IsOptional()
  password: string;
  @IsBoolean()
  @IsOptional()
  isEmailVerified: boolean;
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
  @IsBoolean()
  @IsOptional()
  isArchive: boolean;
}



// export class SignupDto {
//   @IsInt()
//   id: number;
//   @IsString()
//   @IsNotEmpty()
//   name: string;
//   @IsString()
//   @IsNotEmpty()
//   username: string;
//   @IsString()
//   @IsNotEmpty()
//   email: string;
//   @IsString()
//   @IsOptional()
//   passwordHash: string;
//   @IsBoolean()
//   @IsOptional()
//   isEmailVerified: boolean;
//   @IsBoolean()
//   @IsOptional()
//   isActive: boolean;
//   @IsBoolean()
//   @IsOptional()
//   isArchive: boolean;
//   @IsString()
//   @IsOptional()
//   role: $Enums.Role;
//   @IsString()
//   @IsNotEmpty()
//   image: string;
//   @IsInt()
//   @IsOptional()
//   created_by: number;
//   @IsInt()
//   @IsOptional()
//   updated_by: number;
//   @IsArray()
//   blogs:Array<1>
// }

export class EmailVerifyDto {
  @IsBoolean()
  isEmailVerified: boolean;
}
