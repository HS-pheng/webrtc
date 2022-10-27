import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'listings' })
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;
}
