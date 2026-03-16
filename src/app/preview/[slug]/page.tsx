import { PageSchema, Page } from '@/lib/schema/page';
import { renderSection } from '@/components/registry/sectionRegistry';
import { fetchPage } from '@/lib/contentful/adapter';
import { readManifest, readRelease } from '@/lib/publish/storage';

export default async function PreviewPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  let pageData: Page | null = null;

  try {
    const manifest = await readManifest(slug);
    if (manifest?.latestVersion) {
      pageData = await readRelease(slug, manifest.latestVersion);
    }
  } catch (e) {
    // Do nothing here, fallback below
  }

  if (!pageData) {
    // If no published version exists, fallback to the Contentful adapter's drafts
    pageData = await fetchPage(slug, true); 
  }
  
  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
      </div>
    );
  }

  const validation = PageSchema.safeParse(pageData);

  if (!validation.success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Invalid Content Schema</h1>
          <p className="text-red-600 mb-4">The content returned for this slug does not match the valid page structure.</p>
          <pre className="bg-white p-4 overflow-auto rounded text-sm text-red-900 border border-red-100">
            {JSON.stringify(validation.error.format(), null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const page = validation.data;

  return (
    <main className="min-h-screen bg-white">
      {page.sections.map(renderSection)}
    </main>
  );
}
