import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

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

  async find(email: string): Promise<User[]> {
    return this.repo.find({ where: { email: Like(`%${email}%`) } });
  }

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
