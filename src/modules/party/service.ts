import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationError } from 'apollo-server-express';
import { ILike, Repository } from 'typeorm';

import { Maybe } from '../../common/types';

import { PartyCreateDto, PartyGetByIdDto } from './dto';
import { Party } from './schema';

@Injectable()
export class PartyService {
  constructor(@InjectRepository(Party) private db: Repository<Party>) {}

  async create(dto: PartyCreateDto): Promise<Party> {
    return this.db.save(dto);
  }

  async search(q: string): Promise<Array<Party>> {
    return this.db.find({
      where: { name: ILike(`%${q}%`) },
      select: ['id', 'name'],
      relations: { organizer: true },
    });
  }

  async getById({
    id,
    select = [],
    relations = [],
  }: PartyGetByIdDto): Promise<Maybe<Party>> {
    return this.db.findOne({
      where: { id },
      select: ['id', ...select],
      relations,
    });
  }

  async checkAvailability(name: string): Promise<void> {
    const party = await this.db.findOne({ where: { name } });

    if (!party) return;

    throw new ValidationError('name');
  }
}
