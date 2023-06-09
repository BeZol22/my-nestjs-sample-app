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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { LoginUserDto } from './dto/login-user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ jwtToken: string; role: string; message: string }> {
    const { email, password } = loginUserDto;

    return await this.usersService.login(email, password);
  }

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
    const user = await this.usersService.findByToken(data.token);

    if (!user || user.tokenExpiration < new Date()) {
      // throw new Error('Invalid or expired confirmation link.');
      return { message: 'Invalid or expired confirmation link.' };
    }

    if (user && user.isConfirmed === true) {
      return { message: 'Registration already confirmed. Please log in.' };
    }

    user.isConfirmed = true;
    await this.usersService.update(user.id, { isConfirmed: true });
    // await this.usersService.update(user);

    return { message: 'Registration confirmed. You may now log in.' };
  }

  @Serialize(UserDto)
  @Get()
  @UseGuards(AuthGuard)
  async findAll(): Promise<User[] | null> {
    return await this.usersService.findAll();
  }
  // @Get()
  // async findAll(@Query('email') userEmail?: string): Promise<User[] | null> {
  //   if (userEmail) {
  //     return await this.usersService.findByEmail(userEmail);
  //   }
  //   return await this.usersService.findAll();
  // }

  @Serialize(UserDto)
  @Get('/:id')
  @UseGuards(AuthGuard)
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

  // @Serialize(UserDto)
  @Patch('/:id')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<boolean> {
    const parsedId = +id;

    if (isNaN(parsedId)) {
      throw new BadRequestException('ID must be a number.');
    }

    return await this.usersService.remove(parsedId);
  }
}
