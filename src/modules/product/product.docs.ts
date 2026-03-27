export const PRODUCT_TAG = 'Product';
export const CATEGORY_TAG = 'Category';
export const ATTRIBUTE_TAG = 'Attribute';
export const BRAND_TAG = 'Brand';

export const PAGINATION_QUERYSTRING = {
  type: 'object',
  properties: {
    page: { type: 'number', default: 1 },
    limit: { type: 'number', default: 10 },
    search: { type: 'string', nullable: true },
  },
};

export const PRODUCT_PAGINATION_QUERYSTRING = {
  type: 'object',
  properties: {
    ...PAGINATION_QUERYSTRING.properties,
    categoryId: { type: 'string', nullable: true },
    brandId: { type: 'string', nullable: true },
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
      required: ['name', 'description', 'slug', 'categoryId', 'brandId'],
      properties: {
        name: { type: 'string', example: 'Áo thun Nike' },
        description: { type: 'string', example: 'Áo thun cotton cao cấp' },
        slug: { type: 'string', example: 'ao-thun-nike' },
        categoryId: { type: 'string', description: 'ID của danh mục sản phẩm' },
        brandId: { type: 'string', description: 'ID của thương hiệu' },
        type: {
          type: 'string',
          enum: ['SINGLE', 'VARIANT'],
          default: 'SINGLE',
          description: 'Loại sản phẩm: đơn lẻ hoặc có biến thể',
        },
        summary: {
          type: 'string',
          nullable: true,
          example: 'Tóm tắt ngắn gọn về sản phẩm',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          nullable: true,
          example: ['sale', 'new-arrival'],
        },
        thumbnailId: {
          type: 'string',
          nullable: true,
          description: 'ID media dùng làm ảnh đại diện',
        },
        isFeatured: { type: 'boolean', default: false },
        isRefunded: { type: 'boolean', default: false },
        hasWarranty: { type: 'boolean', default: false },
        disableShipping: { type: 'boolean', default: false },
        metaTitle: { type: 'string', nullable: true, example: 'SEO title' },
        metaDescription: {
          type: 'string',
          nullable: true,
          example: 'SEO description',
        },
        metaImageId: {
          type: 'string',
          nullable: true,
          description: 'ID media dùng làm ảnh SEO',
        },
        discountType: {
          type: 'string',
          enum: ['PERCENTAGE', 'FIXED'],
          nullable: true,
        },
        discountValue: { type: 'number', minimum: 0, nullable: true },
        discountStartDate: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        discountEndDate: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        mediaIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách ID media ảnh sản phẩm',
        },
        collectionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách ID bộ sưu tập',
        },
        options: {
          type: 'array',
          description: 'Danh sách các thuộc tính và giá trị có sẵn của sản phẩm',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Color' },
              values: {
                type: 'array',
                items: { type: 'string' },
                example: ['Red', 'Blue'],
              },
            },
          },
        },
        variants: {
          type: 'array',
          description: 'Danh sách biến thể (khi type = VARIANT)',
          items: {
            type: 'object',
            required: ['sku', 'price'],
            properties: {
              sku: { type: 'string', example: 'NK-001-RED-M' },
              price: { type: 'number', example: 250000 },
              stock: { type: 'number', example: 100, default: 0 },
              purchasePrice: { type: 'number', example: 150000 },
              lowStockQuantity: { type: 'number', example: 5, default: 0 },
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
    UPDATE_PRODUCT: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        slug: { type: 'string' },
        categoryId: { type: 'string' },
        brandId: { type: 'string' },
        type: { type: 'string', enum: ['SINGLE', 'VARIANT'] },
        summary: { type: 'string', nullable: true },
        tags: { type: 'array', items: { type: 'string' }, nullable: true },
        thumbnailId: { type: 'string', nullable: true },
        isFeatured: { type: 'boolean' },
        isRefunded: { type: 'boolean' },
        hasWarranty: { type: 'boolean' },
        disableShipping: { type: 'boolean' },
        metaTitle: { type: 'string', nullable: true },
        metaDescription: { type: 'string', nullable: true },
        metaImageId: { type: 'string', nullable: true },
        discountType: {
          type: 'string',
          enum: ['PERCENTAGE', 'FIXED'],
          nullable: true,
        },
        discountValue: { type: 'number', minimum: 0 },
        discountStartDate: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        discountEndDate: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        options: {
          type: 'array',
          description: 'Danh sách các thuộc tính và giá trị có sẵn của sản phẩm',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Color' },
              values: {
                type: 'array',
                items: { type: 'string' },
                example: ['Red', 'Blue'],
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
    GET_ATTRIBUTES_WITH_VALUES: 'Get all attributes with their values',
  },
  ATTRIBUTE_DESCRIPTIONS: {
    CREATE_ATTRIBUTE: 'Create a new attribute (optionally with values)',
    GET_ALL_ATTRIBUTES: 'Get all attributes (paginated)',
    GET_ATTRIBUTE_BY_ID: 'Get attribute by id',
    UPDATE_ATTRIBUTE: 'Update attribute',
    DELETE_ATTRIBUTE: 'Delete attribute',
    DELETE_MANY_ATTRIBUTES: 'Delete multiple attributes by IDs',
    GET_ATTRIBUTES_WITH_VALUES:
      'Get all attributes with their values for product selection',
  },
  ATTRIBUTE_REQUEST_BODIES: {
    CREATE_ATTRIBUTE: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Color' },
        values: {
          type: 'array',
          items: { type: 'string' },
          example: ['Red', 'Blue', 'Green'],
        },
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

// =========================================
// BRAND DOCUMENTATION
// =========================================

export const BRAND_DOCUMENTATION = {
  BRAND_SUMMARIES: {
    CREATE_BRAND: 'Create a new brand',
    GET_ALL_BRANDS: 'Get all brands',
    GET_BRAND_BY_ID: 'Get brand by id',
    UPDATE_BRAND: 'Update brand',
    DELETE_BRAND: 'Delete brand',
    DELETE_MANY_BRANDS: 'Delete many brands',
  },
  BRAND_DESCRIPTIONS: {
    CREATE_BRAND: 'Create a new brand',
    GET_ALL_BRANDS: 'Get all brands',
    GET_BRAND_BY_ID: 'Get brand by id',
    UPDATE_BRAND: 'Update brand',
    DELETE_BRAND: 'Delete brand',
    DELETE_MANY_BRANDS: 'Delete multiple brands by IDs',
  },
  BRAND_REQUEST_BODIES: {
    CREATE_BRAND: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { type: 'string', example: 'Nike' },
        slug: { type: 'string', example: 'nike' },
        logoUrl: { type: 'string', format: 'uri', nullable: true },
        isActive: { type: 'boolean', default: true },
      },
    },
    UPDATE_BRAND: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Adidas' },
        slug: { type: 'string', example: 'adidas' },
        logoUrl: { type: 'string', format: 'uri', nullable: true },
        isActive: { type: 'boolean' },
      },
    },
    DELETE_MANY_BRANDS: DELETE_MANY_SCHEMA,
  },
};
