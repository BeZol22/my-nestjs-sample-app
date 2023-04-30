import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';
import { JwtAuthService } from 'src/services/jwt-auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid authorization header.');
      }
      const token = authHeader.split(' ')[1];
      const decoded = await this.jwtAuthService.verifyToken(token);
      const user = await this.usersService.findOne(decoded.id);
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }
      request.user = user;
      return true;
    } catch (err: any) {
      if (err instanceof JsonWebTokenError) {
        if (err.message === 'jwt malformed') {
          throw new UnauthorizedException('Malformed token.');
        } else {
          throw new UnauthorizedException('Invalid token.');
        }
      }
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
