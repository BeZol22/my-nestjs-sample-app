import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Car {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @Column()
  price: number;

  @AfterInsert()
  logInsert() {
    console.log('Inserted Car with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated Car with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed Car with id', this.id);
  }
}
