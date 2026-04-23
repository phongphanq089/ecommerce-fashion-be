export const NAVIGATION_TAG = 'Navigation';
export const BANNER_TAG = 'Banner';
export const LOGO_TAG = 'Logo';

export const SETTING_DOCUMENTATION = {
  SETTING: 'Settings',
  SETTING_SUMMARIES: {
    GET_LOGO: 'Get logo',
    UPDATE_LOGO: 'Update logo',
    GET_HERO_BANNER: 'Get hero banner',
    UPDATE_HERO_BANNER: 'Update hero banner',
    GET_HOMEPAGE_SECTIONS: 'Get homepage sections',
    UPDATE_HOMEPAGE_SECTIONS: 'Update homepage sections',
  },
  SETTING_DESCRIPTIONS: {
    GET_HERO_BANNER: 'Get hero banner data (including title, image, link...).',
    UPDATE_HERO_BANNER: 'Update or create hero banner data.',
    GET_HOMEPAGE_SECTIONS: 'Get visibility settings for homepage sections.',
    UPDATE_HOMEPAGE_SECTIONS:
      'Update visibility settings for homepage sections.',
  },
  REQUEST_BODY: {
    HERO_BANNER_SCHEMAS: {
      type: 'object',
      required: [
        'title',
        'description',
        'buttonText',
        'buttonLink',
        'imageUrl',
        'position',
      ],
      properties: {
        title: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        buttonText: { type: 'string', nullable: true },
        buttonLink: { type: 'string', nullable: true },
        imageUrl: { type: 'string', nullable: true },
        position: { type: 'string', enum: ['left', 'right'], nullable: true },
      },
    },
    HOMEPAGE_SECTIONS_SCHEMAS: {
      type: 'object',
      properties: {
        showNewArrivals: { type: 'boolean', default: true },
        showFlashSales: { type: 'boolean', default: true },
      },
    },
    LOGO_SCHEMAS: {
      type: 'object',
      required: ['imageUrl'],
      properties: {
        imageUrl: { type: 'string', nullable: true },
      },
    },
  },
};
