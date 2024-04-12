import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptPassword {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
  async comparePassword(
    passwordEntered: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(passwordEntered, hashPassword);
  }
}
