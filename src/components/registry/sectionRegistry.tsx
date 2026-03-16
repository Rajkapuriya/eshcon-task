import React from 'react';
import { Section } from '@/lib/schema/page';
import { Hero } from './sections/Hero';
import { FeatureGrid } from './sections/FeatureGrid';
import { Testimonial } from './sections/Testimonial';
import { Cta } from './sections/Cta';
import { UnsupportedSection } from './UnsupportedSection';
import { ErrorBoundary } from './ErrorBoundary';

type SectionComponent = React.ComponentType<any>;

// Mapping of Section types to React Components
const componentMap: Record<string, SectionComponent> = {
  hero: Hero,
  featureGrid: FeatureGrid,
  testimonial: Testimonial,
  cta: Cta,
  // Add new section types here
};

export function renderSection(section: Section) {
  const Component = componentMap[section.type] || UnsupportedSection;

  return (
    <ErrorBoundary key={section.id}>
      <Component type={section.type} {...section.props} />
    </ErrorBoundary>
  );
}
