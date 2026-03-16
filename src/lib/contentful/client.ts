import * as contentful from 'contentful';

// Contentful SDK Client
// To run pointing at a real space, populate these values in your .env.local
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID || '';
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN || '';
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_TOKEN || '';

export const isContentfulConfigured = Boolean(SPACE_ID && DELIVERY_TOKEN && PREVIEW_TOKEN);

export function getClient(preview: boolean = false) {
  if (!isContentfulConfigured) {
    console.warn('[Contentful] Keys are missing. Adapter will fallback to mocked data.');
    return null;
  }

  return contentful.createClient({
    space: SPACE_ID,
    accessToken: preview ? PREVIEW_TOKEN : DELIVERY_TOKEN,
    host: preview ? 'preview.contentful.com' : 'cdn.contentful.com',
  });
}
