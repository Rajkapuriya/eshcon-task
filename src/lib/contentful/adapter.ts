import { getClient, isContentfulConfigured } from './client';
import { Page, Section, PageSchema } from '../schema/page';

/**
 * Mocks the page layout for environments missing the Contentful SDK keys.
 */
function getMockPage(slug: string): Page {
  return {
    pageId: `mock-page-${slug}`,
    slug,
    title: `Mock Page: ${slug}`,
    sections: [
      {
        id: 'mock-section-hero-1',
        type: 'hero',
        props: { title: 'Welcome to the Studio', subtitle: 'This is loaded from the mock adapter.' },
      },
      {
        id: 'mock-section-features-1',
        type: 'featureGrid',
        props: {
          features: [
            { title: 'Contentful', description: 'Fully integrated headless CMS' },
            { title: 'Redux', description: 'Powerful state management for drafts' },
            { title: 'A11y', description: 'Tested for WCAG AAA accessibility' }
          ]
        },
      },
      {
        id: 'mock-section-cta-1',
        type: 'cta',
        props: { label: 'Go to Editor', url: `/studio/${slug}` },
      }
    ],
  };
}

/**
 * Adapter mapping a raw Contentful Entry into our typed PageSchema
 */
function mapContentfulToPage(entry: any): Page {
  // A resilient adapter to safely map the deeply nested structure.
  
  const sections: Section[] = (entry.fields.sections || []).map((sec: any) => {
    // Extract metadata
    const id = sec.sys?.id || Math.random().toString();
    // Assuming the Content Type ID matches our SectionType enum
    const type = sec.sys?.contentType?.sys?.id || 'unknown'; 
    
    // Everything else in fields goes to props
    const props = sec.fields || {};

    return { id, type, props };
  });

  const page = {
    pageId: entry.sys?.id || 'unknown-page',
    slug: entry.fields.slug || 'unknown-slug',
    title: entry.fields.title || 'Untitled Page',
    sections,
  };

  return PageSchema.parse(page); // Validates and enforces defaults or types
}

/**
 * Fetches a page by slug, preferring the mock adapter if keys are missing.
 */
export async function fetchPage(slug: string, preview: boolean = false): Promise<Page | null> {
  if (!isContentfulConfigured) {
    return getMockPage(slug);
  }

  const client = getClient(preview);
  if (!client) return null;

  try {
    const response = await client.getEntries({
      content_type: 'page',
      'fields.slug': slug,
      include: 2, // resolve referenced sections
      limit: 1,
    });

    if (response.items.length === 0) {
      return null;
    }

    return mapContentfulToPage(response.items[0]);
  } catch (error) {
    console.error(`[Contentful Adapter] Failed to fetch page for slug: ${slug}`, error);
    return null;
  }
}
