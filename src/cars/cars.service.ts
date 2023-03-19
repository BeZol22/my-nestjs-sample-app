import { Injectable } from '@nestjs/common';
import { CarsRepository } from './cars.repository';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(public carsRepo: CarsRepository) {}

  create(createCarDto: CreateCarDto) {
    return this.carsRepo.create(createCarDto.content);
    // return 'This action adds a new car';
  }

  findAll() {
    return this.carsRepo.findAll();
    // return `This action returns all cars`;
  }

  findOne(id: string) {
    return this.carsRepo.findOne(id);
    // return `This action returns a #${id} car`;
  }

  update(id: number, updateCarDto: UpdateCarDto) {
    return `This action updates a #${id} car`;
  }

  remove(id: number) {
    return `This action removes a #${id} car`;
  }
}
