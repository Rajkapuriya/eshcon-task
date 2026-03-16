import React from 'react';

export function Hero({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="bg-slate-900 text-white py-20 px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
        {title || 'Default Hero Title'}
      </h1>
      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
        {subtitle || 'This is the default subtitle for the hero section.'}
      </p>
    </section>
  );
}
