import React from 'react';

export function UnsupportedSection({ type }: { type: string }) {
  return (
    <div className="p-8 my-4 border-2 border-dashed border-red-500 bg-red-50 text-red-900 rounded-md">
      <h3 className="text-lg font-bold">Unsupported Section: {type}</h3>
      <p className="text-sm">This section type is not currently mapped in the registry.</p>
    </div>
  );
}
