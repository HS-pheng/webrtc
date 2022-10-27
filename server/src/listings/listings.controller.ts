import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateListingDto } from './dtos/create-listing.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private _service: ListingsService) {}

  @Get()
  async getMany() {
    return this._service.getMany();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this._service.getOne(id);
  }

  @Post()
  createOne(@Body() dto: CreateListingDto) {
    return this._service.create(dto);
  }
}
