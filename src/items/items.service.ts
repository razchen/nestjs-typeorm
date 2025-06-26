import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { Comment } from './entities/comment.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const listing = this.itemsRepository.manager.create(Listing, {
      ...createItemDto.listing,
      rating: 0,
    });

    const tags = createItemDto.tags.map((createTagDto) =>
      this.itemsRepository.manager.create(Tag, createTagDto),
    );

    const item = this.itemsRepository.create({
      name: createItemDto.name,
      public: createItemDto.public,
      listing: listing,
      comments: [],
      tags,
    });

    const created = await this.itemsRepository.save(item);
    return created;
  }

  async findAll() {
    return this.itemsRepository.find({
      relations: { listing: true, comments: true, tags: true },
    });
  }

  async findOne(id: number) {
    return await this.itemsRepository.findOne({
      where: { id },
      relations: { listing: true, comments: true, tags: true },
    });
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    item.public = updateItemDto.public;

    item.comments = updateItemDto.comments.map((createCommentDto) =>
      this.itemsRepository.manager.create(Comment, createCommentDto),
    );

    const updated = await this.itemsRepository.save(item);
    return updated;
  }

  async remove(id: number) {
    const result = await this.itemsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Item not found');
    }

    return { message: 'Item successfully deleted' };
  }
}
