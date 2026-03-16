import { fetchPage } from '@/lib/contentful/adapter';
import { StoreProvider } from '@/lib/store/StoreProvider';
import { StudioCanvas } from '@/components/studio/StudioCanvas';
import { EditorSidebar } from '@/components/studio/EditorSidebar';

export default async function StudioPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  // We fetch the draft implicitly as this is the Studio Editor
  const pageData = await fetchPage(slug, true);
  
  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Page not found or failed to load.</h1>
      </div>
    );
  }

  return (
    <StoreProvider>
      <div className="flex w-full bg-black">
        {/* Editor Main Canvas */}
        <StudioCanvas initialPage={pageData} />
        
        {/* Sidebar Controls */}
        <EditorSidebar />
      </div>
    </StoreProvider>
  );
}
