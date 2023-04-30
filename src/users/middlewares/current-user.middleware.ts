import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { JwtAuthService } from 'src/services/jwt-auth.service';
import { JsonWebTokenError } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header.');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await this.jwtAuthService.verifyToken(token);
      const user = await this.usersService.findOne(decoded.id);
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }
      req.currentUser = user;
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

    next();
  }
}
