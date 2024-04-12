import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'jsonwebtoken';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enum/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../../src/utils/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  accessTokensecret = process.env.ACCESS_TOKEN_SECRET;
  refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      //requiredroles is array of roles sent from  controllers
      context.getHandler(),
      context.getClass(),
    ]);
    // console.log(requiredRoles, 'checking required role');
    if (!requiredRoles) {
      return true;
    }

    const requestBody = context.switchToHttp().getRequest(); //to get access to request body
    const tokenArray = requestBody.headers.authorization.split(' ');
    const token = tokenArray[tokenArray.length - 1];
    const userData = this.jwtService.verifyJwt(
      token,
      this.accessTokensecret,
    ) as JwtPayload;
    const { email } = userData.data;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    requestBody.userId = user.id;
    const isValidRole = requiredRoles.some((role) => user.role === role);
    if (!isValidRole)
      throw new HttpException('Role does not match', HttpStatus.FORBIDDEN);
    return isValidRole;
  }
}
