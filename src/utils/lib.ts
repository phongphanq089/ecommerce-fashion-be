import { MediaType } from '@prisma/client';

export function toMediaType(mimeType: string): MediaType {
  if (!mimeType) return MediaType.OTHER;

  const type = mimeType.split('/')[0];

  switch (type) {
    case 'image':
      return MediaType.IMAGE;
    case 'video':
      return MediaType.VIDEO;
    case 'application': {
      if (mimeType.includes('pdf')) return MediaType.DOCUMENT;
      return MediaType.DOCUMENT;
    }
    default:
      return MediaType.OTHER;
  }
}
