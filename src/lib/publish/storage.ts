import fs from 'fs/promises';
import path from 'path';
import { put, list } from '@vercel/blob';

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export async function writeManifest(slug: string, version: string) {
  const data = { latestVersion: version, lastPublishedAt: new Date().toISOString() };
  if (useBlob()) {
    await put(`releases/${slug}/manifest.json`, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
    });
  } else {
    const slugDir = path.join(process.cwd(), 'releases', slug);
    await fs.mkdir(slugDir, { recursive: true }).catch(() => {});
    await fs.writeFile(path.join(slugDir, 'manifest.json'), JSON.stringify(data, null, 2));
  }
}

export async function writeRelease(slug: string, version: string, pageData: any) {
  if (useBlob()) {
    await put(`releases/${slug}/${version}.json`, JSON.stringify(pageData), {
      access: 'public',
      contentType: 'application/json',
    });
  } else {
    const slugDir = path.join(process.cwd(), 'releases', slug);
    await fs.mkdir(slugDir, { recursive: true }).catch(() => {});
    await fs.writeFile(path.join(slugDir, `${version}.json`), JSON.stringify(pageData, null, 2));
  }
}

export async function readManifest(slug: string): Promise<{ latestVersion: string } | null> {
  if (useBlob()) {
    try {
      const { blobs } = await list({ prefix: `releases/${slug}/manifest` });
      if (blobs.length === 0) return null;
      // Vercel Blob creates random suffixes. Sort by uploadedAt descending to get the newest.
      blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      const res = await fetch(blobs[0].url);
      return await res.json();
    } catch {
      return null;
    }
  } else {
    try {
      const manifestPath = path.join(process.cwd(), 'releases', slug, 'manifest.json');
      return JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    } catch {
      return null;
    }
  }
}

export async function readRelease(slug: string, version: string): Promise<any | null> {
  if (useBlob()) {
    try {
      const { blobs } = await list({ prefix: `releases/${slug}/${version}` });
      if (blobs.length === 0) return null;
      blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      const res = await fetch(blobs[0].url);
      return await res.json();
    } catch {
      return null;
    }
  } else {
    try {
      const versionPath = path.join(process.cwd(), 'releases', slug, `${version}.json`);
      return JSON.parse(await fs.readFile(versionPath, 'utf-8'));
    } catch {
      return null;
    }
  }
}
