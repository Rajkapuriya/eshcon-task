'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setDraftPage } from '@/lib/store/features/draftPageSlice';
import { selectSection } from '@/lib/store/features/uiSlice';
import { renderSection } from '@/components/registry/sectionRegistry';
import { Page } from '@/lib/schema/page';

export function StudioCanvas({ initialPage }: { initialPage: Page }) {
  const dispatch = useDispatch();
  const page = useSelector((state: RootState) => state.draftPage.page);
  const selectedSectionId = useSelector((state: RootState) => state.ui.selectedSectionId);

  useEffect(() => {
    // Only set if we don't have a draft page, to preserve reload safety state
    // In a real app we might sync this with localStorage for true reload safety
    if (!page) {
      dispatch(setDraftPage(initialPage));
    }
  }, [initialPage, page, dispatch]);

  if (!page) return <div className="p-8">Loading studio...</div>;

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto min-h-screen relative shadow-inner">
      <div className="max-w-[1200px] mx-auto bg-white min-h-screen shadow-md my-8 relative ring-1 ring-gray-200">
        {page.sections.map((section) => {
          const isSelected = selectedSectionId === section.id;
          return (
            <div
              key={section.id}
              onClick={() => dispatch(selectSection(section.id))}
              className={`relative group cursor-pointer border-2 transition-colors ${
                isSelected ? 'border-blue-500 z-10' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="pointer-events-none">
                {renderSection(section)}
              </div>
              
              {isSelected && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 select-none pointer-events-none rounded-bl-md">
                  {section.type} Outline
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
