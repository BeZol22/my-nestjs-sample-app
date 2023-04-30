import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtAuthService {
  private readonly jwtSecret: string = process.env.JWT_SECRET;
  private readonly jwtExpiresIn: string = '1h';

  constructor(private readonly jwtService: JwtService) {}

  async signPayload(payload: { id: User['id'] }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
    });
  }

  async verifyToken(token: string): Promise<{ id: User['id'] }> {
    return this.jwtService.verifyAsync(token, { secret: this.jwtSecret });
  }
}
