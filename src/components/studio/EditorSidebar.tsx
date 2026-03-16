'use client';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { updateSectionProps, reorderSections, removeSection, addSection, setDraftPage } from '@/lib/store/features/draftPageSlice';
import { startPublishAnalysis, setPublishAnalysisResult, publishSuccess, publishError } from '@/lib/store/features/publishSlice';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Trash, Plus } from 'lucide-react';

export function EditorSidebar() {
  const dispatch = useDispatch();
  const page = useSelector((state: RootState) => state.draftPage.page);
  const selectedSectionId = useSelector((state: RootState) => state.ui.selectedSectionId);
  const { hasUnsavedChanges } = useSelector((state: RootState) => state.draftPage);

  if (!page) return <div className="w-80 border-l bg-white shrink-0 p-4">Loading...</div>;

  const selectedIndex = page.sections.findIndex((s) => s.id === selectedSectionId);
  const selectedSection = selectedIndex !== -1 ? page.sections[selectedIndex] : null;

  const handlePropChange = (key: string, value: string) => {
    if (selectedSectionId) {
      dispatch(updateSectionProps({ sectionId: selectedSectionId, props: { [key]: value } }));
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    dispatch(startPublishAnalysis());
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      
      dispatch(setPublishAnalysisResult({ version: data.version, changelog: data.changelog }));
      dispatch(publishSuccess());
      // Re-set the clean page state essentially syncing the 'published' copy internally
      dispatch(setDraftPage(page));
      alert(`Successfully published ${data.version} (${data.diffType}):\n\n${data.changelog.join('\n')}`);
    } catch (e: any) {
      dispatch(publishError(e.message));
      alert('Error during publish: ' + e.message);
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white shadow-xl shrink-0 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-lg">Page Studio</h2>
        <Button 
          onClick={handlePublish}
          disabled={!hasUnsavedChanges}
          size="sm"
          className={hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Publish
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Settings</h3>
          <p className="text-sm"><strong>Path:</strong> /{page.slug}</p>
          <p className="text-sm"><strong>Title:</strong> {page.title}</p>
        </div>

        <hr className="border-gray-100" />

        {selectedSection ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Edit {selectedSection.type}
              </h3>
              <div className="flex gap-1">
                <Button 
                  variant="outline" size="icon" className="h-7 w-7"
                  disabled={selectedIndex === 0}
                  onClick={() => dispatch(reorderSections({ fromIndex: selectedIndex, toIndex: selectedIndex - 1 }))}
                ><ArrowUp className="w-3 h-3" /></Button>
                <Button 
                  variant="outline" size="icon" className="h-7 w-7"
                  disabled={selectedIndex === page.sections.length - 1}
                  onClick={() => dispatch(reorderSections({ fromIndex: selectedIndex, toIndex: selectedIndex + 1 }))}
                ><ArrowDown className="w-3 h-3" /></Button>
                <Button 
                  variant="destructive" size="icon" className="h-7 w-7 ml-1"
                  onClick={() => dispatch(removeSection(selectedSection.id))}
                ><Trash className="w-3 h-3" /></Button>
              </div>
            </div>

            {/* Dynamic Props Editor (Limited support as requested) */}
            <div className="space-y-4">
              {['title', 'subtitle', 'quote', 'author', 'label', 'url'].map((key) => {
                const val = selectedSection.props[key];
                if (typeof val === 'string' || val === undefined) {
                  // Only show fields that explicitly exist as strings, or if it's specific hardcoded fields
                  // FeatureGrid 'features' array requires a complex object editor not implemented in Lite
                  if (selectedSection.type === 'featureGrid' && key !== 'title' && key !== 'subtitle') return null;

                  return (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{key}</label>
                      <input 
                        className="w-full text-sm border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                        value={val || ''}
                        onChange={(e) => handlePropChange(key, e.target.value)}
                        placeholder={`Enter ${key}...`}
                      />
                    </div>
                  );
                }
                return null;
              })}
              <div className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded">
                Note: Complex/nested props are hidden in this Lite visual editor demo.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 p-8 bg-gray-50 rounded border border-dashed border-gray-200">
            Select a section in the canvas to edit its properties.
          </div>
        )}

        <hr className="border-gray-100" />
        
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Add Section</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['hero', 'featureGrid', 'testimonial', 'cta'] as const).map(type => (
               <Button 
                 key={type} 
                 variant="outline" 
                 size="sm" 
                 className="justify-start text-xs font-medium"
                 onClick={() => dispatch(addSection({ 
                   index: page.sections.length, 
                   section: { id: `new-${type}-${Date.now()}`, type, props: {} } 
                 }))}
               >
                 <Plus className="w-3 h-3 mr-1" /> {type}
               </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
