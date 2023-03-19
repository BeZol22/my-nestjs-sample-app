import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { CarsRepository } from './cars.repository';

@Module({
  controllers: [CarsController],
  providers: [CarsService, CarsRepository],
})
export class CarsModule {}
