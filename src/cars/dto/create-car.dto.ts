import { IsString } from 'class-validator';

export class CreateCarDto {
  @IsString()
  content: string;
}
