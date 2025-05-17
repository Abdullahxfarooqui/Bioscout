"use client";

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-[#1A1A1A] text-white py-16 md:py-24 animate-fadeIn">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1DE954]">
            Discover Biodiversity in Islamabad
          </h1>
          <p className="text-lg md:text-xl mb-8 animate-slideInLeft">
            Join our community to explore, document, and preserve the natural wonders of Pakistan's capital city.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center animate-slideInRight">
            <Link 
              href="/observations" 
              className="px-6 py-3 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-colors duration-300"
            >
              Browse Observations
            </Link>
            <Link 
              href="/observations/submit" 
              className="px-6 py-3 border-2 border-[#1DE954] text-[#1DE954] font-bold rounded-md hover:bg-[#1DE954] hover:text-black transition-colors duration-300"
            >
              Contribute Data
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}