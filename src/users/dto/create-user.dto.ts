import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsString()
  password: string;

  token: string;

  tokenExpiration: Date;

  isConfirmed: boolean;
}
