'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/sections/Footer';

export default function Projects() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="text-center max-w-2xl">
          {/* Construction tape style */}
          <div className="mb-8 py-3 px-6 bg-[#F4A259] text-[#0C0A09] font-bold text-sm uppercase tracking-widest transform -rotate-2">
            Work in Progress
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#F5F0E8]">
            App Hub
          </h1>

          <p className="text-[#a8a29e] text-lg md:text-xl mb-8">
            Something&apos;s cooking. Check back soon.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-[#8BA989] hover:bg-[#4C7A55] text-[#0C0A09] rounded-lg transition-colors font-medium"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
