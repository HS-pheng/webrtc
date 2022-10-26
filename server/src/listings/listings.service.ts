import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListingDto } from './dtos/create-listing.dto';
import { Listing } from './listings.entity';

@Injectable()
export class ListingsService {
  constructor(@InjectRepository(Listing) private _repo: Repository<Listing>) {}

  getMany() {
    return this._repo.find();
  }

  getOne(id: number) {
    return this._repo.findOne({ where: { id } });
  }

  create(data: CreateListingDto) {
    return this._repo.save(data);
  }
}
