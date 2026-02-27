import {
  CreateCollectionInput,
  UpdateCollectionInput,
  AddProductsToCollectionInput,
} from './collection.validate';
import { CollectionRepository } from './collection.repository';
import { ConflictError, NotFoundError } from '@/utils/errors';

export class CollectionService {
  private repo: CollectionRepository;
  constructor(repo: CollectionRepository) {
    this.repo = repo;
  }

  async createCollection(data: CreateCollectionInput) {
    const existSlug = await this.repo.findBySlug(data.slug);
    if (existSlug) {
      throw new ConflictError('Collection slug already exists');
    }
    const existName = await this.repo.findByName(data.name);
    if (existName) {
      throw new ConflictError('Collection name already exists');
    }
    return this.repo.createCollection(data);
  }

  async getAllCollections(page: number = 1, limit: number = 10) {
    const { collections, total } = await this.repo.getAllCollections(
      page,
      limit
    );
    return {
      data: collections,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCollectionById(id: string) {
    const collection = await this.repo.getCollectionById(id);
    if (!collection) throw new NotFoundError('Collection not found');
    return collection;
  }

  async updateCollection(id: string, data: UpdateCollectionInput) {
    await this.getCollectionById(id); // Ensure exists
    return this.repo.updateCollection(id, data);
  }

  async deleteCollection(id: string) {
    await this.getCollectionById(id);
    return this.repo.deleteCollection(id);
  }

  async addProducts(id: string, data: AddProductsToCollectionInput) {
    await this.getCollectionById(id);
    return this.repo.addProductsToCollection(id, data.productIds);
  }
}
