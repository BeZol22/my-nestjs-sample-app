import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { JwtAuthService } from 'src/services/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // MailerModule.forRoot({
    //   transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    //   defaults: {
    //     from: '"nest-modules" <modules@nestjs.com>',
    //   },
    //   template: {
    //     dir: __dirname + '/templates',
    //     adapter: new HandlebarsAdapter(),
    //     options: {
    //       strict: true,
    //     },
    //   },
    // }),

    // Async version below
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: process.env.EMAIL_DEFAULT_FROM,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthService, JwtService],
})
export class UsersModule {}
