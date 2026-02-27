export const COLLECTION_TAG = 'Collection';

export const PAGINATION_QUERYSTRING = {
  type: 'object',
  properties: {
    page: { type: 'number', default: 1 },
    limit: { type: 'number', default: 10 },
  },
};

export const COLLECTION_DOCUMENTATION = {
  COLLECTION_SUMMARIES: {
    CREATE_COLLECTION: 'Create a new collection',
    GET_ALL_COLLECTIONS: 'Get all collections',
    GET_COLLECTION_BY_ID: 'Get collection matching ID',
    UPDATE_COLLECTION: 'Update an existing collection',
    DELETE_COLLECTION: 'Delete an existing collection',
    ADD_PRODUCTS: 'Add products to a collection',
  },
  COLLECTION_DESCRIPTIONS: {
    CREATE_COLLECTION: 'Create a new collection with the given data.',
    GET_ALL_COLLECTIONS:
      'Get a paginated list of all collections along with their associated products.',
    GET_COLLECTION_BY_ID:
      'Retrieve a specific collection and its associated products by its unique ID.',
    UPDATE_COLLECTION: 'Update an existing collection with new data.',
    DELETE_COLLECTION:
      'Delete a collection by its unique ID. This will also remove the association with its products, but will not delete the products themselves.',
    ADD_PRODUCTS:
      'Add an array of product IDs to a specific collection matching the ID.',
  },
  COLLECTION_REQUEST_BODIES: {
    CREATE_COLLECTION: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string', nullable: true },
        imageUrl: { type: 'string', nullable: true },
        isActive: { type: 'boolean', default: true },
      },
    },
    ADD_PRODUCTS: {
      type: 'object',
      required: ['productIds'],
      properties: {
        productIds: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  },
};
