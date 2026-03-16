import React from 'react';

export function FeatureGrid({ features }: { features?: Array<{ title: string; description: string }> }) {
  const displayFeatures = features || [
    { title: 'Feature 1', description: 'Description for feature one.' },
    { title: 'Feature 2', description: 'Description for feature two.' },
    { title: 'Feature 3', description: 'Description for feature three.' },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50 border-y border-gray-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayFeatures.map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
