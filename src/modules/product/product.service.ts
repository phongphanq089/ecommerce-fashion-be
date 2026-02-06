import { ProductRepository } from './product.repository';
import {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
  CreateAttributeInput,
  UpdateAttributeInput,
  DeleteManyProductsInput,
  DeleteManyCategoriesInput,
  DeleteManyAttributesInput,
} from './product.validate';
import { GetProductsFilter } from './product.repository';
import { ConflictError } from '@/utils/errors';

export class ProductService {
  private repo: ProductRepository;
  constructor(repo: ProductRepository) {
    this.repo = repo;
  }

  //======= PRODUCT SERVICE =======//
  async createProduct(data: CreateProductInput) {
    const existCategory = await this.repo.findCategoryById(data.categoryId);

    const createProduct = await this.repo.createProduct(data);
    if (!existCategory) {
      throw new Error('Category not found');
    }
    return createProduct;
  }

  async getAllProducts(filter: GetProductsFilter) {
    const { products, total } = await this.repo.getAllProducts(filter);
    return {
      data: products,
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await this.repo.getProductById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    // Check if product exists
    await this.getProductById(id);
    return this.repo.updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    // Check if product exists
    await this.getProductById(id);
    return this.repo.deleteProduct(id);
  }

  async deleteManyProducts(data: DeleteManyProductsInput) {
    return this.repo.deleteManyProducts(data.ids);
  }

  //======= CATEGORY SERVICE =======//

  async createCategory(data: CreateCategoryInput) {
    const existSlug = await this.repo.findCategoryBySlug(data.slug);
    const existName = await this.repo.findCategoryByName(data.name);
    if (existSlug) {
      throw new ConflictError('Category slug already exists');
    }
    if (existName) {
      throw new ConflictError('Category name already exists');
    }
    const createCategory = await this.repo.createCategory(data);
    return createCategory;
  }
  async getAllCategories(page: number = 1, limit: number = 10) {
    const { categories, total } = await this.repo.getAllCategories(page, limit);
    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCategoryById(id: string) {
    const category = await this.repo.getCategoryById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    await this.getCategoryById(id); // Ensure exist
    return this.repo.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id); // Ensure exist
    return this.repo.deleteCategory(id);
  }

  async deleteManyCategories(data: DeleteManyCategoriesInput) {
    return this.repo.deleteManyCategories(data.ids);
  }

  //======= ATTRIBUTE SERVICE =======//

  async createAttribute(data: CreateAttributeInput) {
    return this.repo.createAttribute(data);
  }

  async getAllAttributes(page: number = 1, limit: number = 10) {
    const { attributes, total } = await this.repo.getAllAttributes(page, limit);
    return {
      data: attributes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAttributeById(id: string) {
    const attribute = await this.repo.getAttributeById(id);
    if (!attribute) throw new Error('Attribute not found');
    return attribute;
  }

  async updateAttribute(id: string, data: UpdateAttributeInput) {
    await this.getAttributeById(id); // Ensure exist
    return this.repo.updateAttribute(id, data);
  }

  async deleteAttribute(id: string) {
    await this.getAttributeById(id); // Ensure exist
    return this.repo.deleteAttribute(id);
  }

  async deleteManyAttributes(data: DeleteManyAttributesInput) {
    return this.repo.deleteManyAttributes(data.ids);
  }
}
