import React from 'react';

export function Testimonial({ quote, author }: { quote?: string; author?: string }) {
  return (
    <section className="py-16 px-4 bg-white text-center">
      <div className="max-w-3xl mx-auto">
        <blockquote className="text-2xl font-medium text-gray-900 italic mb-6">
          "{quote || 'This product completely changed how our team operates. Highly recommended!'}"
        </blockquote>
        <div className="text-lg font-bold text-gray-600">
          — {author || 'Alex Johnson, CEO'}
        </div>
      </div>
    </section>
  );
}
