export const PRODUCT_TAG = 'Product';
export const CATEGORY_TAG = 'Category';
export const ATTRIBUTE_TAG = 'Attribute';

export const PAGINATION_QUERYSTRING = {
  type: 'object',
  properties: {
    page: { type: 'number', default: 1 },
    limit: { type: 'number', default: 10 },
    search: { type: 'string', nullable: true },
    categoryId: { type: 'string', format: 'cuid', nullable: true },
    minPrice: { type: 'number', minimum: 0, nullable: true },
    maxPrice: { type: 'number', minimum: 0, nullable: true },
    sort: {
      type: 'string',
      enum: ['price_asc', 'price_desc', 'newest', 'oldest'],
      default: 'newest',
      nullable: true,
    },
  },
};

const DELETE_MANY_SCHEMA = {
  type: 'object',
  required: ['ids'],
  properties: {
    ids: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
    },
  },
};

// =========================================
// PRODUCT DOCUMENTATION
// =========================================
export const PRODUCT_DOCUMENTATION = {
  PRODUCT_SUMMARIES: {
    CREATE_PRODUCT: 'Create a new product',
    GET_ALL_PRODUCTS: 'Get all products',
    GET_PRODUCT_BY_ID: 'Get product by id',
    UPDATE_PRODUCT: 'Update product',
    DELETE_PRODUCT: 'Delete product',
    DELETE_MANY_PRODUCTS: 'Delete many products',
  },
  PRODUCT_DESCRIPTIONS: {
    CREATE_PRODUCT: 'Create a new product',
    GET_ALL_PRODUCTS: 'Get all products',
    GET_PRODUCT_BY_ID: 'Get product by id',
    UPDATE_PRODUCT: 'Update product',
    DELETE_PRODUCT: 'Delete product',
    DELETE_MANY_PRODUCTS: 'Delete multiple products by IDs',
  },
  PRODUCT_REQUEST_BODIES: {
    CREATE_PRODUCT: {
      type: 'object',
      required: ['name', 'price', 'description', 'categoryId', 'images'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        slug: { type: 'string' },
        categoryId: { type: 'string', format: 'cuid' },
        mediaIds: {
          type: 'array',
          items: { type: 'string', format: 'cuid' },
        },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            required: ['sku', 'price'],
            properties: {
              sku: { type: 'string' },
              price: { type: 'number' },
              stock: { type: 'number' },
              attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Color' },
                    value: { type: 'string', example: 'Red' },
                  },
                },
              },
            },
          },
        },
      },
    },
    DELETE_MANY_PRODUCTS: DELETE_MANY_SCHEMA,
  },
};

// =========================================
// CATEGORY DOCUMENTATION
// =========================================

export const CATEGORY_DOCUMENTATION = {
  CATEGORY_SUMMARIES: {
    CREATE_CATEGORY: 'Create a new category',
    GET_ALL_CATEGORY: 'Get all categories',
    GET_CATEGORY_BY_ID: 'Get category by id',
    UPDATE_CATEGORY: 'Update category',
    DELETE_CATEGORY: 'Delete category',
    DELETE_MANY_CATEGORIES: 'Delete many categories',
  },
  CATEGORY_DESCRIPTIONS: {
    CREATE_CATEGORY: 'Create a new category',
    GET_ALL_CATEGORY: 'Get all categories',
    GET_CATEGORY_BY_ID: 'Get category by id',
    UPDATE_CATEGORY: 'Update category',
    DELETE_CATEGORY: 'Delete category',
    DELETE_MANY_CATEGORIES: 'Delete multiple categories by IDs',
  },
  CATEGORY_REQUEST_BODIES: {
    CREATE_CATEGORY: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        parentId: { type: 'string', format: 'uuid' },
      },
    },
    DELETE_MANY_CATEGORIES: DELETE_MANY_SCHEMA,
  },
};

// =========================================
// ATTRIBUTE DOCUMENTATION
// =========================================

export const ATTRIBUTE_DOCUMENTATION = {
  ATTRIBUTE_SUMMARIES: {
    CREATE_ATTRIBUTE: 'Create a new attribute',
    GET_ALL_ATTRIBUTES: 'Get all attributes',
    GET_ATTRIBUTE_BY_ID: 'Get attribute by id',
    UPDATE_ATTRIBUTE: 'Update attribute',
    DELETE_ATTRIBUTE: 'Delete attribute',
    DELETE_MANY_ATTRIBUTES: 'Delete many attributes',
  },
  ATTRIBUTE_DESCRIPTIONS: {
    CREATE_ATTRIBUTE: 'Create a new attribute',
    GET_ALL_ATTRIBUTES: 'Get all attributes',
    GET_ATTRIBUTE_BY_ID: 'Get attribute by id',
    UPDATE_ATTRIBUTE: 'Update attribute',
    DELETE_ATTRIBUTE: 'Delete attribute',
    DELETE_MANY_ATTRIBUTES: 'Delete multiple attributes by IDs',
  },
  ATTRIBUTE_REQUEST_BODIES: {
    CREATE_ATTRIBUTE: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Color' },
      },
    },
    UPDATE_ATTRIBUTE: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Size' },
      },
    },
    DELETE_MANY_ATTRIBUTES: DELETE_MANY_SCHEMA,
  },
};
