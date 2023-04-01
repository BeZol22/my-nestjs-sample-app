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
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('/register')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    const token = uuidv4();
    const user = await this.usersService.create(createUserDto, token);

    // send confirmation email
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirm your registration',
      template: 'confirm-registration',
      context: {
        firstName: user.firstName,
        confirmLink: `${process.env.FRONTEND_URL}/auth/confirm-registration?token=${token}`,
      },
    });

    return {
      message: `Registration successful. Please check your email for confirmation instructions.`,
    };
  }

  @Post('/confirm-registration')
  async confirmRegistration(@Body() data: { token: string }) {
    console.log('DATA RECEIVED FOR CONFIRM_REGISTRATION: ', data.token);

    const user = await this.usersService.findByToken(data.token);

    if (!user || user.tokenExpiration < new Date()) {
      // throw new Error('Invalid or expired confirmation link.');
      return { message: 'Invalid or expired confirmation link.' };
    }

    user.isConfirmed = true;
    await this.usersService.update(user.id, { isConfirmed: true });
    // await this.usersService.update(user);

    return { message: 'Registration confirmed. You may now log in.' };
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
