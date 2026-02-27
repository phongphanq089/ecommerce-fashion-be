import { Database } from '@/plugins/database';
import {
  CreateCollectionInput,
  UpdateCollectionInput,
} from './collection.validate';
import { collections, productsToCollections } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { count } from 'drizzle-orm';

export class CollectionRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async findBySlug(slug: string) {
    return this.db.query.collections.findFirst({
      where: eq(collections.slug, slug),
    });
  }

  async findByName(name: string) {
    return this.db.query.collections.findFirst({
      where: eq(collections.name, name),
    });
  }

  async createCollection(data: CreateCollectionInput) {
    const [collection] = await this.db
      .insert(collections)
      .values(data)
      .returning();
    return collection;
  }

  async getAllCollections(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const allCollections = await this.db.query.collections.findMany({
      limit: limit,
      offset: offset,
      orderBy: [desc(collections.createdAt)],
      with: {
        products: {
          with: {
            product: {
              with: {
                images: {
                  with: {
                    media: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const [total] = await this.db.select({ count: count() }).from(collections);

    return {
      collections: allCollections,
      total: total?.count || 0,
    };
  }

  async getCollectionById(id: string) {
    return this.db.query.collections.findFirst({
      where: eq(collections.id, id),
      with: {
        products: {
          with: {
            product: {
              with: {
                images: {
                  with: {
                    media: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateCollection(id: string, data: UpdateCollectionInput) {
    const [updated] = await this.db
      .update(collections)
      .set(data)
      .where(eq(collections.id, id))
      .returning();
    return updated;
  }

  async deleteCollection(id: string) {
    return this.db.delete(collections).where(eq(collections.id, id));
  }

  async addProductsToCollection(collectionId: string, productIds: string[]) {
    if (productIds.length > 0) {
      await this.db
        .insert(productsToCollections)
        .values(
          productIds.map((productId) => ({
            collectionId,
            productId,
          }))
        )
        .onConflictDoNothing();
    }
    return this.getCollectionById(collectionId);
  }
}
