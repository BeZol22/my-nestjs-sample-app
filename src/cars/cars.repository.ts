import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';

@Injectable()
export class CarsRepository {
  async findOne(id: string) {
    const contents = await readFile('cars.json', 'utf-8');
    const cars = JSON.parse(contents);

    return cars[id];
  }

  async findAll() {
    const contents = await readFile('cars.json', 'utf-8');
    const cars = JSON.parse(contents);

    return cars;
  }

  async create(car: string) {
    const contents = await readFile('cars.json', 'utf-8');
    const cars = JSON.parse(contents);

    const id = Math.floor(Math.random() * 999);

    cars[id] = {
      id,
      content: car,
    };

    await writeFile('cars.json', JSON.stringify(cars));
  }
}
