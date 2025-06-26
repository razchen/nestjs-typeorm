import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ItemsService', () => {
  let service: ItemsService;
  let itemsRepository: jest.Mocked<Repository<Item>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: {
            find: jest.fn(),
            findOneOrFail: jest.fn(),
            findOneByOrFail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            manager: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    itemsRepository = module.get(getRepositoryToken(Item));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }];
      itemsRepository.find.mockResolvedValue(mockItems as any);

      const result = await service.findAll();
      expect(result).toEqual(mockItems);
      expect(itemsRepository.find).toHaveBeenCalledWith({
        relations: { listing: true, comments: true, tags: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single item', async () => {
      const mockItem = { id: 1 };
      itemsRepository.findOneOrFail.mockResolvedValue(mockItem as any);

      const result = await service.findOne(1);
      expect(result).toEqual(mockItem);
      expect(itemsRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { listing: true, comments: true, tags: true },
      });
    });
  });

  describe('create', () => {
    it('should create and return the new item', async () => {
      const createItemDto = {
        name: 'Test Item',
        public: true,
        listing: { description: 'desc' },
        tags: [{ content: 'tag1' }],
      };

      const mockListing = { id: 1 };
      const mockTags = [{ id: 1 }];
      const mockCreatedItem = {
        id: 1,
        ...createItemDto,
        listing: mockListing,
        tags: mockTags,
      };

      (itemsRepository.manager.create as jest.Mock).mockImplementation(
        (_, obj) => obj,
      );

      itemsRepository.create.mockReturnValue(mockCreatedItem as any);
      itemsRepository.save.mockResolvedValue(mockCreatedItem as any);

      const result = await service.create(createItemDto as any);
      expect(result).toEqual(mockCreatedItem);
      expect(itemsRepository.manager.create).toHaveBeenCalled();
      expect(itemsRepository.create).toHaveBeenCalled();
      expect(itemsRepository.save).toHaveBeenCalledWith(mockCreatedItem);
    });
  });

  describe('update', () => {
    it('should update and return the item', async () => {
      const updateItemDto = {
        public: false,
        comments: [{ content: 'New Comment' }],
      };

      const mockItem = {
        id: 1,
        public: true,
        comments: [],
      };

      const mockUpdatedItem = {
        ...mockItem,
        public: updateItemDto.public,
        comments: [{ content: 'New Comment' }],
      };

      itemsRepository.findOneByOrFail.mockResolvedValue(mockItem as any);
      (itemsRepository.manager.create as jest.Mock).mockImplementation(
        (_, obj) => obj,
      );

      itemsRepository.save.mockResolvedValue(mockUpdatedItem as any);

      const result = await service.update(1, updateItemDto as any);

      expect(result).toEqual(mockUpdatedItem);
      expect(itemsRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(itemsRepository.manager.create).toHaveBeenCalled();
      expect(itemsRepository.save).toHaveBeenCalledWith({
        ...mockItem,
        public: false,
        comments: [{ content: 'New Comment' }],
      });
    });
  });

  describe('remove', () => {
    it('should delete the item', async () => {
      itemsRepository.delete.mockResolvedValue({ raw: {}, affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Item successfully deleted' });
      expect(itemsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if item not found', async () => {
      itemsRepository.delete.mockResolvedValue({ raw: {}, affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(itemsRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
