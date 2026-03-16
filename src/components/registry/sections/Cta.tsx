'use client';

import React from 'react';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Cta({ label, url }: { label?: string; url?: string }) {
  return (
    <section className="py-20 px-4 bg-blue-600 text-white text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <Link 
          href={url || '/signup'} 
          className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), "font-semibold px-8 py-6 text-lg")}
        >
          {label || 'Sign Up Now'}
        </Link>
      </div>
    </section>
  );
}
