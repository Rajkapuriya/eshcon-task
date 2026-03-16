import { describe, it, expect } from 'vitest';
import { calculateSemverDiff, applyVersionBump, DiffResult } from '../src/lib/publish/semver';
import { Page } from '../src/lib/schema/page';

const basePage: Page = {
  pageId: 'page-1',
  slug: 'test',
  title: 'Test',
  sections: [
    { id: '1', type: 'hero', props: { text: 'Hello' } }
  ]
};

describe('calculateSemverDiff', () => {
  it('detects a completely new page as major', () => {
    const res = calculateSemverDiff(null, basePage);
    expect(res.versionType).toBe('major');
  });

  it('detects identical pages as none', () => {
    const res = calculateSemverDiff(basePage, { ...basePage });
    expect(res.versionType).toBe('none');
  });

  it('detects prop updates as patch', () => {
    const newPage = {
      ...basePage,
      sections: [{ id: '1', type: 'hero' as const, props: { text: 'World' } }]
    };
    const res = calculateSemverDiff(basePage, newPage);
    expect(res.versionType).toBe('patch');
  });

  it('detects added section as minor', () => {
    const newPage = {
      ...basePage,
      sections: [
        ...basePage.sections,
        { id: '2', type: 'cta' as const, props: {} }
      ]
    };
    const res = calculateSemverDiff(basePage, newPage);
    expect(res.versionType).toBe('minor');
  });

  it('detects removed section as major', () => {
    const startPage = {
      ...basePage,
      sections: [
        ...basePage.sections,
        { id: '2', type: 'cta' as const, props: {} }
      ]
    };
    const res = calculateSemverDiff(startPage, basePage);
    expect(res.versionType).toBe('major');
  });

  it('applies Highest Bump correctly (major over patch)', () => {
    const startPage = {
      ...basePage,
      sections: [
        { id: '1', type: 'hero' as const, props: { text: 'Hello' } },
        { id: '2', type: 'cta' as const, props: {} }
      ]
    };
    // Drop cta (major), change hero text (patch)
    const endPage = {
      ...basePage,
      sections: [
        { id: '1', type: 'hero' as const, props: { text: 'World' } }
      ]
    };
    const res = calculateSemverDiff(startPage, endPage);
    expect(res.versionType).toBe('major');
    expect(res.changelog).toContain('Removed section: cta (2)');
    expect(res.changelog).toContain('Updated props for section: hero (1)');
  });
});

describe('applyVersionBump', () => {
  it('bumps match correctly', () => {
    expect(applyVersionBump('1.2.3', 'patch')).toBe('1.2.4');
    expect(applyVersionBump('1.2.3', 'minor')).toBe('1.3.0');
    expect(applyVersionBump('1.2.3', 'major')).toBe('2.0.0');
    expect(applyVersionBump('1.2.3', 'none')).toBe('1.2.3');
  });
});
