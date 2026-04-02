import { Database } from '@/plugins/database';
import {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
  CreateAttributeInput,
  UpdateAttributeInput,
  CreateBrandInput,
  UpdateBrandInput,
} from './product.validate';
import { eq, inArray, count } from 'drizzle-orm';
import {
  attributes,
  attributeValues,
  attributeValuesToVariants,
  categories,
  productImages,
  products,
  productVariants,
  productsToCollections,
  brands,
  productAttributeOptions,
} from '@/db/schema';
import { ilike, and, gte, lte, desc, asc, exists } from 'drizzle-orm';

export interface GetProductsFilter {
  page: number;
  limit: number;
  search?: string | undefined;
  categoryId?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | undefined;
  brandId?: string;
}

export class ProductRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async findCategoryById(id: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  }

  async findCategoryByName(name: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.name, name),
    });
  }

  async findCategoryBySlug(slug: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
  }

  async findProductBySlug(slug: string) {
    return this.db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
  }

  async createProduct(data: CreateProductInput) {
    const {
      name,
      description,
      slug,
      categoryId,
      variants,
      mediaIds,
      collectionIds,
      type,
      brandId,
      summary,
      tags,
      thumbnailId,
      isFeatured,
      isRefunded,
      hasWarranty,
      metaTitle,
      metaDescription,
      metaImageId,
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate,
      disableShipping,
    } = data;

    return await this.db.transaction(async (tx) => {
      // 1. Create Product
      const [newProduct] = await tx
        .insert(products)
        .values({
          name,
          description,
          slug,
          categoryId,
          type,
          brandId,
          summary,
          tags,
          thumbnailId,
          isFeatured,
          isRefunded,
          hasWarranty,
          metaTitle,
          metaDescription,
          metaImageId,
          discountType,
          discountValue,
          discountStartDate: discountStartDate
            ? new Date(discountStartDate)
            : null,
          discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
          disableShipping,
        })
        .returning();

      if (!newProduct) {
        throw new Error('Failed to create product');
      }

      // 2. Create Product Images
      if (mediaIds && mediaIds.length > 0) {
        await tx.insert(productImages).values(
          mediaIds.map((mediaId, index) => ({
            productId: newProduct.id,
            mediaId,
            displayOrder: index,
          }))
        );
      }

      // 2.5 Associate with Collections
      if (collectionIds && collectionIds.length > 0) {
        await tx
          .insert(productsToCollections)
          .values(
            collectionIds.map((collectionId) => ({
              productId: newProduct.id,
              collectionId,
            }))
          )
          .onConflictDoNothing();
      }

      const productId = newProduct.id;
      const { options } = data;

      // 1.5. Create Product Options (If any)
      if (options && options.length > 0) {
        for (const option of options) {
          // Find or create attribute
          let attr = await tx.query.attributes.findFirst({
            where: eq(attributes.name, option.name),
          });

          if (!attr) {
            const [newAttr] = await tx
              .insert(attributes)
              .values({ name: option.name })
              .returning();
            attr = newAttr;
          }

          // Handle values
          for (const valName of option.values) {
            let val = await tx.query.attributeValues.findFirst({
              where: and(
                eq(attributeValues.attributeId, attr!.id),
                eq(attributeValues.value, valName)
              ),
            });

            if (!val) {
              const [newVal] = await tx
                .insert(attributeValues)
                .values({
                  attributeId: attr!.id,
                  value: valName,
                })
                .returning();
              val = newVal;
            }

            // Link to Product
            await tx
              .insert(productAttributeOptions)
              .values({
                productId,
                attributeValueId: val!.id,
              })
              .onConflictDoNothing();
          }
        }
      }

      // 2. Create Variants
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          // 3.1 Create Variant
          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId: newProduct.id,
              sku: variant.sku,
              price: variant.price,
              stockQuantity: variant.stock,
            })
            .returning();

          // 3.2 Handle Attributes
          if (variant.attributes && variant.attributes.length > 0) {
            for (const attr of variant.attributes) {
              // Find or Create Attribute (e.g., "Color")
              let attributeId: string;
              const existingAttr = await tx.query.attributes.findFirst({
                where: eq(attributes.name, attr.name),
              });

              if (existingAttr) {
                attributeId = existingAttr.id;
              } else {
                const [createdAttr] = await tx
                  .insert(attributes)
                  .values({ name: attr.name })
                  .returning();

                if (!createdAttr) {
                  throw new Error(`Failed to create attribute: ${attr.name}`);
                }
                attributeId = createdAttr.id;
              }

              // Find or Create Attribute Value (e.g., "Red")
              let valueId: string | undefined;
              // Check if value exists for this attribute
              // Note: We need to use DB query carefully inside transaction
              const existingValue = await tx.query.attributeValues.findFirst({
                where: (val, { and, eq }) =>
                  and(
                    eq(val.attributeId, attributeId),
                    eq(val.value, attr.value)
                  ),
              });

              if (existingValue) {
                valueId = existingValue.id;
              } else if (attributeId) {
                const [createdValue] = await tx
                  .insert(attributeValues)
                  .values({
                    attributeId,
                    value: attr.value,
                  })
                  .returning();
                if (createdValue) {
                  valueId = createdValue.id;
                }
              }
              if (valueId && newVariant) {
                // 3.3 Link Attribute Value to Variant
                await tx.insert(attributeValuesToVariants).values({
                  productVariantId: newVariant.id,
                  attributeValueId: valueId,
                });
              }
            }
          }
        }
      }

      return await this.getProductById(newProduct.id);
    });
  }

  private mapProductOptions(product: any) {
    if (!product) return null;

    const groupedOptions = (product.options || []).reduce(
      (acc: any[], curr: any) => {
        const attrName = curr.attributeValue?.attribute?.name;
        const val = curr.attributeValue?.value;

        if (attrName && val) {
          const existing = acc.find((item) => item.name === attrName);
          if (existing) {
            existing.values.push(val);
          } else {
            acc.push({ name: attrName, values: [val] });
          }
        }
        return acc;
      },
      []
    );

    const mappedVariants = (product.variants || []).map((v: any) => ({
      ...v,
      stock: v.stockQuantity,
    }));

    const totalStock = mappedVariants.reduce(
      (acc: number, variant: any) => acc + (variant.stock || 0),
      0
    );

    const { options, variants: oldVariants, tags, ...rest } = product;
    return {
      ...rest,
      options: groupedOptions,
      variants: mappedVariants,
      stock: totalStock,
      tags: tags || [],
    };
  }

  async getAllProducts(query: GetProductsFilter) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sort,
    } = query;

    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (search) {
      whereConditions.push(ilike(products.name, `%${search}%`));
    }

    if (categoryId) {
      whereConditions.push(eq(products.categoryId, categoryId));
    }

    if (brandId) {
      whereConditions.push(eq(products.brandId, brandId));
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.push(
        exists(
          this.db
            .select()
            .from(productVariants)
            .where(
              and(
                eq(productVariants.productId, products.id),
                minPrice !== undefined
                  ? gte(productVariants.price, minPrice)
                  : undefined,
                maxPrice !== undefined
                  ? lte(productVariants.price, maxPrice)
                  : undefined
              )
            )
        )
      );
    }

    let orderBy;
    switch (sort) {
      case 'oldest':
        orderBy = asc(products.createdAt);
        break;
      case 'newest':
      default:
        orderBy = desc(products.createdAt);
        break;
    }

    const allProducts = await this.db.query.products.findMany({
      limit: limit,
      offset: offset,
      where: and(...whereConditions),
      orderBy: orderBy,
      with: {
        brand: true,
        thumbnail: true,
        metaImage: true,
        images: {
          with: {
            media: true,
          },
        },
        category: true,
        collections: {
          with: {
            collection: true,
          },
        },
        options: {
          with: {
            attributeValue: {
              with: {
                attribute: true,
              },
            },
          },
        },
        variants: {
          with: {
            attributes: {
              with: {
                attributeValue: {
                  with: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const [total] = await this.db
      .select({ count: count() })
      .from(products)
      .where(and(...whereConditions));

    return {
      products: allProducts.map((p) => this.mapProductOptions(p)),
      total: total?.count || 0,
    };
  }

  async getProductById(id: string) {
    const product = await this.db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        brand: true,
        thumbnail: true,
        metaImage: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
          with: {
            media: true,
          },
        },
        category: true,
        collections: {
          with: {
            collection: true,
          },
        },
        options: {
          with: {
            attributeValue: {
              with: {
                attribute: true,
              },
            },
          },
        },
        variants: {
          with: {
            attributes: {
              with: {
                attributeValue: {
                  with: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!product) return null;

    return this.mapProductOptions(product);
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const {
      variants,
      mediaIds,
      collectionIds,
      options,
      discountStartDate,
      discountEndDate,
      ...productData
    } = data;

    return await this.db.transaction(async (tx) => {
      // 1. Prepare and Update basic product info
      const updatePayload: Record<string, any> = { ...productData };
      if (discountStartDate !== undefined) {
        updatePayload.discountStartDate = discountStartDate ? new Date(discountStartDate) : null;
      }
      if (discountEndDate !== undefined) {
        updatePayload.discountEndDate = discountEndDate ? new Date(discountEndDate) : null;
      }

      if (Object.keys(updatePayload).length > 0) {
        await tx
          .update(products)
          .set(updatePayload)
          .where(eq(products.id, id));
      }

      // 2. Update Options (Sync)
      if (options !== undefined) {
        // Delete existing options
        await tx
          .delete(productAttributeOptions)
          .where(eq(productAttributeOptions.productId, id));

        // Insert new options
        if (options && options.length > 0) {
          for (const option of options) {
            // Find or create attribute
            let attr = await tx.query.attributes.findFirst({
              where: eq(attributes.name, option.name),
            });

            if (!attr) {
              const [newAttr] = await tx
                .insert(attributes)
                .values({ name: option.name })
                .returning();
              attr = newAttr;
            }

            // Handle values
            for (const valName of option.values) {
              let val = await tx.query.attributeValues.findFirst({
                where: and(
                  eq(attributeValues.attributeId, attr!.id),
                  eq(attributeValues.value, valName)
                ),
              });

              if (!val) {
                const [newVal] = await tx
                  .insert(attributeValues)
                  .values({
                    attributeId: attr!.id,
                    value: valName,
                  })
                  .returning();
                val = newVal;
              }

              // Link to Product
              await tx
                .insert(productAttributeOptions)
                .values({
                  productId: id,
                  attributeValueId: val!.id,
                })
                .onConflictDoNothing();
            }
          }
        }
      }

      // 3. Variant/Media Sync can be added here if needed in the future

      return this.getProductById(id);
    });
  }

  async deleteProduct(id: string) {
    return await this.db.delete(products).where(eq(products.id, id));
  }

  async deleteManyProducts(ids: string[]) {
    return await this.db.delete(products).where(inArray(products.id, ids));
  }

  // --- Category Methods ---

  async createCategory(data: CreateCategoryInput) {
    const { name, slug, parentId } = data;
    const category = await this.db
      .insert(categories)
      .values({
        name,
        slug,
        parentId,
      })
      .returning()
      .then((rows) => rows[0]!);
    return category;
  }

  async getAllCategories(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const allCategories = await this.db.query.categories.findMany({
      limit: limit,
      offset: offset,
      with: {
        parent: true,
      },
    });
    const [total] = await this.db.select({ count: count() }).from(categories);

    return {
      categories: allCategories,
      total: total?.count || 0,
    };
  }

  async getCategoryById(id: string) {
    return this.db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        parent: true,
        children: true,
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    return this.db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
  }

  async deleteCategory(id: string) {
    return this.db.delete(categories).where(eq(categories.id, id));
  }

  async deleteManyCategories(ids: string[]) {
    return this.db.delete(categories).where(inArray(categories.id, ids));
  }

  // --- Attribute Methods ---

  async createAttribute(data: CreateAttributeInput) {
    const { name, values } = data;

    return await this.db.transaction(async (tx) => {
      const [attribute] = await tx
        .insert(attributes)
        .values({ name })
        .returning();

      if (values && values.length > 0) {
        await tx.insert(attributeValues).values(
          values.map((value) => ({
            attributeId: attribute!.id,
            value,
          }))
        );
      }

      return attribute;
    });
  }

  async getAllAttributes(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const allAttributes = await this.db.query.attributes.findMany({
      limit: limit,
      offset: offset,
    });
    const [total] = await this.db.select({ count: count() }).from(attributes);
    return {
      attributes: allAttributes,
      total: total?.count || 0,
    };
  }

  async getAttributeById(id: string) {
    return this.db.query.attributes.findFirst({
      where: eq(attributes.id, id),
    });
  }

  async updateAttribute(id: string, data: UpdateAttributeInput) {
    const [attribute] = await this.db
      .update(attributes)
      .set(data)
      .where(eq(attributes.id, id))
      .returning();
    return attribute;
  }

  async deleteAttribute(id: string) {
    return this.db.delete(attributes).where(eq(attributes.id, id));
  }

  async deleteManyAttributes(ids: string[]) {
    return this.db.delete(attributes).where(inArray(attributes.id, ids));
  }

  // brand method
  async createBrand(data: CreateBrandInput) {
    const [brand] = await this.db.insert(brands).values(data).returning();
    return brand;
  }
  async getAllBrands(page: number = 1, limit: number = 100) {
    const offset = (page - 1) * limit;
    const allBrands = await this.db.query.brands.findMany({
      limit,
      offset,
      orderBy: asc(brands.name),
    });

    const [total] = await this.db.select({ count: count() }).from(brands);
    return {
      brands: allBrands,
      total: total?.count || 0,
    };
  }
  async getBrandBySlug(slug: string) {
    return this.db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });
  }
  async getBrandById(id: string) {
    return this.db.query.brands.findFirst({
      where: eq(brands.id, id),
    });
  }
  async updateBrand(id: string, data: UpdateBrandInput) {
    const [brand] = await this.db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();

    return brand;
  }
  async deleteBrand(id: string) {
    return this.db.delete(brands).where(eq(brands.id, id));
  }
  async deleteManyBrandsSchema(ids: string[]) {
    return this.db.delete(brands).where(inArray(brands.id, ids));
  }

  async getAttributesWithValues() {
    return this.db.query.attributes.findMany({
      with: {
        values: true,
      },
    });
  }
}
