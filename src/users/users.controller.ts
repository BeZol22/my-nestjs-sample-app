import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/register')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.create(createUserDto);

    return { message: `Successfully registered with email: ${user.email}.` };
  }

  @Get()
  async findAll(@Query('email') userEmail?: string): Promise<User[] | null> {
    if (userEmail) {
      return await this.usersService.find(userEmail);
    }
    return await this.usersService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    const parsedId = +id;

    if (isNaN(parsedId)) {
      throw new BadRequestException('ID must be a number.');
    }

    const userById = await this.usersService.findOne(parsedId);

    if (!userById) {
      throw new NotFoundException('User not found.');
    }

    return userById;
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const parsedId = +id;

    if (isNaN(parsedId)) {
      throw new BadRequestException('ID must be a number.');
    }

    return await this.usersService.update(parsedId, updateUserDto);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string): Promise<boolean> {
    const parsedId = +id;

    if (isNaN(parsedId)) {
      throw new BadRequestException('ID must be a number.');
    }

    return await this.usersService.remove(parsedId);
  }
}
