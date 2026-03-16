import { Page, Section } from '@/lib/schema/page';
import { isEqual, xorWith } from 'lodash';

export type VersionType = 'patch' | 'minor' | 'major' | 'none';

export interface DiffResult {
  versionType: VersionType;
  changelog: string[];
}

/**
 * Rules:
 * - Patch: Text/prop change
 * - Minor: Added section / optional prop
 * - Major: Removed section / changed type / break required prop
 */
export function calculateSemverDiff(oldPage: Page | null, newPage: Page): DiffResult {
  // If no prior version, it's a completely new major release
  if (!oldPage) {
    return {
      versionType: 'major',
      changelog: ['Initial release'],
    };
  }

  // Idempotent check
  if (isEqual(oldPage, newPage)) {
    return {
      versionType: 'none',
      changelog: [],
    };
  }

  const logs: string[] = [];
  let highestBump: VersionType = 'none';

  const bump = (type: VersionType) => {
    const weights: Record<VersionType, number> = { none: 0, patch: 1, minor: 2, major: 3 };
    if (weights[type] > weights[highestBump]) {
      highestBump = type;
    }
  };

  const oldSectionsMap = new Map<string, Section>();
  oldPage.sections.forEach((s) => oldSectionsMap.set(s.id, s));

  const newSectionsMap = new Map<string, Section>();
  newPage.sections.forEach((s) => newSectionsMap.set(s.id, s));

  // Check for added, changed, or removed sections
  newPage.sections.forEach((newSec) => {
    const oldSec = oldSectionsMap.get(newSec.id);

    if (!oldSec) {
      bump('minor');
      logs.push(`Added new section: ${newSec.type} (${newSec.id})`);
    } else {
      if (oldSec.type !== newSec.type) {
        bump('major');
        logs.push(`Changed section type: ${oldSec.type} -> ${newSec.type} (${newSec.id})`);
      } else if (!isEqual(oldSec.props, newSec.props)) {
        bump('patch');
        logs.push(`Updated props for section: ${newSec.type} (${newSec.id})`);
      }
    }
  });

  oldPage.sections.forEach((oldSec) => {
    if (!newSectionsMap.has(oldSec.id)) {
      bump('major');
      logs.push(`Removed section: ${oldSec.type} (${oldSec.id})`);
    }
  });

  // Reordering check (if everything matches precisely but order differs)
  if (highestBump === 'none') {
    const oldOrder = oldPage.sections.map((s) => s.id);
    const newOrder = newPage.sections.map((s) => s.id);
    if (!isEqual(oldOrder, newOrder)) {
      bump('patch');
      logs.push('Reordered sections');
    }
  }

  return {
    versionType: highestBump,
    changelog: logs,
  };
}

export function applyVersionBump(currentVersion: string, bumpType: VersionType): string {
  if (bumpType === 'none') return currentVersion;

  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}
