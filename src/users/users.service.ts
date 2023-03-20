import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.repo.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException('User with email already exists');
    }

    const user = this.repo.create({ firstName, lastName, email, password });
    return this.repo.save(user);
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
      throw new NotFoundException('User not found');
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
      throw new NotFoundException('User not found');
    }

    const deleteResult = await this.repo.delete(userToDelete.id);
    return deleteResult.affected > 0;
  }
}
