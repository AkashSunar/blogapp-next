import { ApiProperty } from '@nestjs/swagger';
import { Auth } from '@prisma/client';

export class AuthEntity implements Auth {
  @ApiProperty()
  id: number;
  @ApiProperty()
  email: string;
  @ApiProperty()
  otpToken: number;
}
