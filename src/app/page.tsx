import Link from 'next/link';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      <Header />
      <Hero />
      
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1DE954]">
            Explore Our Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Submit Observations" 
              description="Add your biodiversity sightings and contribute to our database."
              icon="📝"
              link="/observations/submit"
            />
            <FeatureCard 
              title="Explore Data" 
              description="Browse through observations from the community."
              icon="🔍"
              link="/observations"
            />
            <FeatureCard 
              title="Ask AI" 
              description="Have questions about Islamabad's biodiversity? Our AI can help!"
              icon="🤖"
              link="/ask"
            />
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 bg-[#282828]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#1DE954]">
            About BioScout Islamabad
          </h2>
          <p className="max-w-3xl mx-auto text-center text-lg">
            BioScout Islamabad is a community-driven platform that aims to document and preserve 
            the biodiversity of Pakistan's capital city. By contributing your observations, 
            you're helping build a comprehensive database that supports conservation efforts 
            and environmental awareness.
          </p>
        </div>
      </section>
    </main>
  );
}