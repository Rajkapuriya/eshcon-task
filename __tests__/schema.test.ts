import { describe, it, expect } from 'vitest';
import { PageSchema, SectionSchema } from '../src/lib/schema/page';

describe('Schema Validation', () => {
  it('validates a correct Section', () => {
    const validSection = {
      id: '123',
      type: 'hero',
      props: { title: 'Hello', subtitle: 'World' },
    };
    
    const result = SectionSchema.safeParse(validSection);
    expect(result.success).toBe(true);
  });

  it('fails on an incorrect Section type', () => {
    const invalidSection = {
      id: '123',
      type: 'unknown_type',
      props: {},
    };
    
    const result = SectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('validates a complete Page structure', () => {
    const validPage = {
      pageId: 'page-1',
      slug: 'home',
      title: 'Home Page',
      sections: [
        {
          id: 's-1',
          type: 'hero',
          props: { heading: 'Welcome' },
        },
      ],
    };
    
    const result = PageSchema.safeParse(validPage);
    expect(result.success).toBe(true);
  });
});
