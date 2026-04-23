export const NAVIGATION_DOCUMENTATION = {
  NAVIGATION_TAG: 'Navigation api',
  NAVIGATION_SUMMARIES: {
    INIT_SYSTEM: 'Initialize systemnavigations',
    CREATE: 'Create new one',
    GET_MEGA_MENU: 'Get mega menu data',
    GET_ALL: 'Get all menus',
    GET_TREE: 'Get menus as tree',
    GET_BY_ID: 'Get menu by id',
    UPDATE: 'Update menu',
    DELETE: 'Remove menu',
  },
  NAVIGATION_DESCRIPTIONS: {
    INIT_SYSTEM:
      'Insert system navigation items (Home, Shop, About, Contact) if they do not exist.',
    CREATE:
      'Create a new navigation item (e.g., a main link, a category group, or a specific item).',
    GET_MEGA_MENU:
      'Retrieve collections (isActive=true), categories, and attributes so the frontend can automatically render the submenu into 3 fixed groups.',
    GET_ALL: 'Retrieve all navigation items as a flat array.',
    GET_TREE:
      'Retrieve all navigation items structured as a tree (for frontend Mega Menu rendering).',
    GET_BY_ID: 'Retrieve details of a navigation item by ID.',
    UPDATE:
      'Update navigation information (such as name, link, or visibility status).',
    DELETE:
      'Delete a navigation item (will throw an error if it has child references due to RDBMS restrictions).',
  },
  NAVIGATION_SCHEMAS: {
    REQUEST_BODY: {
      type: 'object',
      required: ['type', 'label'],
      properties: {
        type: {
          type: 'string',
          enum: ['MAIN_LINK', 'CATEGORY_GROUP', 'CATEGORY_ITEM'],
        },
        label: { type: 'string' },
        href: { type: 'string', nullable: true },
        categoryType: { type: 'string', nullable: true },
        displayOrder: { type: 'integer', default: 0 },
        parentId: { type: 'string', nullable: true },
        metadata: { type: 'object', nullable: true },
        isActive: { type: 'boolean', default: true },
      },
    },
  },
};
