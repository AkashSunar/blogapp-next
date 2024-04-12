import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { JwtService } from '../utils/jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthsGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  accessTokensecret = process.env.ACCESS_TOKEN_SECRET;
  refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requestBody = context.switchToHttp().getRequest();
    const tokenArray = requestBody.headers.authorization.split(' ');
    const token = tokenArray[tokenArray.length - 1];
    try {
      const decodedToken = this.jwtService.verifyJwt(
        token,
        this.accessTokensecret,
      ) as JwtPayload;
      requestBody.userId = decodedToken.data.id;
      return token !== null;
      // return token;
    } catch (error) {
      const refreshToken = requestBody.cookies.refreshToken;
      const decodedRefreshToken = this.jwtService.verifyJwt(
        refreshToken,
        this.refreshTokenSecret,
      ) as JwtPayload;
      requestBody.userId = decodedRefreshToken.data.id;
      const payload = {
        email: decodedRefreshToken.data.email,
        id: decodedRefreshToken.data.id,
      };
      const newAccessToken = this.jwtService.generateJwt(payload);
      // return newAccessToken;
      return newAccessToken !== null;
    }
  }
}
