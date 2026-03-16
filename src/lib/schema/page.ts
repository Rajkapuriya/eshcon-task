import { z } from 'zod';

// Define the exact props mapping expected for each section type.
// If not fully specified, we use a flexible Record<string, unknown> as requested,
// but we will enforce basic props where possible.

export const SectionTypeSchema = z.enum([
  'hero',
  'featureGrid',
  'testimonial',
  'cta',
]);

export const SectionSchema = z.object({
  id: z.string(),
  type: SectionTypeSchema,
  props: z.record(z.string(), z.unknown()),
});

export const PageSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(SectionSchema),
});

export type SectionType = z.infer<typeof SectionTypeSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Page = z.infer<typeof PageSchema>;
