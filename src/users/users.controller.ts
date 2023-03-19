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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    return await this.usersService.create(email, password);
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
      throw new BadRequestException('ID must be a number');
    }

    return await this.usersService.findOne(parsedId);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const parsedId = +id;

    if (isNaN(parsedId)) {
      throw new BadRequestException('ID must be a number');
    }

    return await this.usersService.update(parsedId, updateUserDto);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string): Promise<boolean> {
    const parsedId = +id;

    if (isNaN(parsedId)) {
      throw new BadRequestException('ID must be a number');
    }

    return await this.usersService.remove(parsedId);
  }
}
