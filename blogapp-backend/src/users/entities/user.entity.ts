import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
export class UserEntity implements User {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  passwordHash: string;
  @ApiProperty()
  isEmailVerified: boolean;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  isArchive: boolean;
  @ApiProperty()
  image: string;
  @ApiProperty()
  role: $Enums.Role;
  @ApiProperty()
  created_by: number;
  @ApiProperty()
  updated_by: number;
}
