import { Injectable } from '@nestjs/common';
import { CreateWikiDto } from './dto/create-wiki.dto';
import { UpdateWikiDto } from './dto/update-wiki.dto';

@Injectable()
export class WikiService {
  create(createWikiDto: CreateWikiDto) {
    return 'This action adds a new wiki';
  }

  findAll() {
    return `This action returns all wiki`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wiki`;
  }

  update(id: number, updateWikiDto: UpdateWikiDto) {
    return `This action updates a #${id} wiki`;
  }

  remove(id: number) {
    return `This action removes a #${id} wiki`;
  }
}
