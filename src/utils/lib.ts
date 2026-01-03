// MediaType matches the mediaTypeEnum values from schema.ts
type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';

export function toMediaType(mimeType: string): MediaType {
  if (!mimeType) return 'OTHER';

  const type = mimeType.split('/')[0];

  switch (type) {
    case 'image':
      return 'IMAGE';
    case 'video':
      return 'VIDEO';
    case 'application': {
      if (mimeType.includes('pdf')) return 'DOCUMENT';
      return 'DOCUMENT';
    }
    default:
      return 'OTHER';
  }
}
