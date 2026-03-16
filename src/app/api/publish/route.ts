import { NextResponse } from 'next/server';
import { PageSchema, Page } from '@/lib/schema/page';
import { calculateSemverDiff, applyVersionBump } from '@/lib/publish/semver';
import { readManifest, readRelease, writeManifest, writeRelease } from '@/lib/publish/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const draftPage = PageSchema.parse(body.page);

    let currentVersion = '0.0.0';
    let oldPage: Page | null = null;

    const manifest = await readManifest(draftPage.slug);
    if (manifest?.latestVersion) {
      currentVersion = manifest.latestVersion;
      oldPage = await readRelease(draftPage.slug, currentVersion);
    }

    // Determine SemVer bump
    const diff = calculateSemverDiff(oldPage, draftPage);

    if (diff.versionType === 'none') {
      return NextResponse.json({
        success: true,
        message: 'No changes detected. Draft is identical to the published version.',
        version: currentVersion,
        changelog: [],
      });
    }

    const newVersion = applyVersionBump(currentVersion, diff.versionType);

    // Save the new snapshot and manifest
    await writeRelease(draftPage.slug, newVersion, draftPage);
    await writeManifest(draftPage.slug, newVersion);

    return NextResponse.json({
      success: true,
      message: 'Published successfully',
      version: newVersion,
      diffType: diff.versionType,
      changelog: diff.changelog,
    });
  } catch (error: any) {
    console.error('Publishing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
