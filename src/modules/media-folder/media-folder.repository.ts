import * as schema from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { Database } from '@/plugins/database';
import {
  MediaFolder,
  MediaFolderCreateInput,
  MediaFolderUpdateInput,
  MediaFolderWithRelations,
} from './media-folder.validation';

export class MediaFolderRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(data: MediaFolderCreateInput) {
    return this.db
      .insert(schema.mediaFolders)
      .values(data)
      .returning()
      .then((rows) => rows[0]);
  }
  async findAll(): Promise<MediaFolder[]> {
    return this.db.query.mediaFolders.findMany({
      orderBy: (mediaFolders, { asc }) => asc(mediaFolders.name),
      with: {
        media: true,
        children: true,
      },
    });
  }
  async findById(id: string): Promise<MediaFolderWithRelations | undefined> {
    return this.db.query.mediaFolders.findFirst({
      where: eq(schema.mediaFolders.id, id),
      with: {
        media: true,
        children: true,
      },
    });
  }
  async findByNameAndParent(name: string, parentId: string | null) {
    return this.db.query.mediaFolders.findFirst({
      where: and(
        eq(schema.mediaFolders.name, name),
        parentId === null
          ? isNull(schema.mediaFolders.parentId)
          : eq(schema.mediaFolders.parentId, parentId)
      ),
    });
  }
  async update(
    id: string,
    data: Partial<MediaFolderUpdateInput>
  ): Promise<MediaFolder> {
    return this.db
      .update(schema.mediaFolders)
      .set(data)
      .where(eq(schema.mediaFolders.id, id))
      .returning()
      .then((rows) => rows[0]!);
  }

  async delete(id: string): Promise<MediaFolder> {
    return this.db
      .delete(schema.mediaFolders)
      .where(eq(schema.mediaFolders.id, id))
      .returning()
      .then((rows) => rows[0]!);
  }
}
