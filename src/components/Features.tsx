import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type FeatureCardProps = {
  number: number;
  title: string;
  description: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  }
};

function FeatureCard({ number, title, description }: FeatureCardProps) {
  return (
    <motion.div 
      className="card p-6 flex flex-col items-center text-center h-full"
      variants={cardVariants}
    >
      <motion.div 
        className="w-16 h-16 rounded-full bg-[#1DE954] flex items-center justify-center mb-4"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span className="text-[#1A1A1A] text-2xl font-bold">{number}</span>
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[#CCCCCC]">{description}</p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section className="py-12 md:py-16 px-4 bg-[#282828]">
      <div className="container mx-auto">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          How It Works
        </motion.h2>
        
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <FeatureCard 
            number={1} 
            title="Submit Observations" 
            description="Upload photos and details of plants and animals you spot around Islamabad."
          />
          <FeatureCard 
            number={2} 
            title="AI Identification" 
            description="Our AI helps identify species from your photos, making biodiversity documentation easier."
          />
          <FeatureCard 
            number={3} 
            title="Ask Questions" 
            description="Use our AI-powered Q&A system to learn more about local biodiversity."
          />
        </motion.div>
      </div>
    </section>
  );
}