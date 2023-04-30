import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Like, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtAuthService } from 'src/services/jwt-auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ jwtToken: string; role: string; message: string }> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtToken = await this.jwtAuthService.signPayload(tokenPayload);
    const successMessage: string = 'Login successful.';

    return { jwtToken, role: user.role, message: successMessage };
  }

  async create(createUserDto: CreateUserDto, token: string): Promise<User> {
    const { firstName, lastName, email, password } = createUserDto;

    const existingUser = await this.repo.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException(`User with email "${email}" already exists.`);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.repo.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
      token: token,
      tokenExpiration: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      isConfirmed: false,
    });

    try {
      return await this.repo.save(user);
    } catch (error) {
      console.error(error);
      if (error.code === '23505') {
        // '23505' is the code for unique constraint violation in Postgres
        throw new ConflictException(
          `User with email "${email}" already exists.`,
        );
      } else if (error instanceof QueryFailedError) {
        const constraintNameMatch = /constraint "(\w+)"/.exec(error.message);
        const constraintName = constraintNameMatch?.[1];
        if (constraintName) {
          switch (constraintName) {
            case 'CHK_0123456789':
              throw new BadRequestException('Invalid value for field.');
            // Add additional cases for other check constraints
            default:
              throw new HttpException(
                'Failed to save user to database.',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
          }
        } else {
          throw new HttpException(
            'Failed to save user to database.',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        throw new HttpException(
          'Failed to save user to database.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findByToken(token: string): Promise<User> {
    return this.repo.findOneBy({ token });
  }

  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<User | null> {
    // if (typeof id !== 'number') {
    //   throw new BadRequestException('ID must be a number');
    // }

    const user = await this.repo.findOneBy({ id });
    return user || null;
  }

  async findByEmail(email: string): Promise<User> {
    return this.repo.findOne({ where: { email } });
  }

  // async find(email: string): Promise<User[]> {
  //   return this.repo.find({ where: { email: Like(`%${email}%`) } });
  // }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const existingUser = await this.findOne(id);

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    const updatedUser = {
      ...existingUser,
      ...attrs,
    };

    return this.repo.save(updatedUser);
  }

  async remove(id: number): Promise<boolean> {
    const userToDelete = await this.findOne(id);

    if (!userToDelete) {
      throw new NotFoundException('User not found.');
    }

    const deleteResult = await this.repo.delete(userToDelete.id);
    return deleteResult.affected > 0;
  }
}
