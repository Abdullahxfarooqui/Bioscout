import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

export default function FeatureCard({ title, description, icon, link }: FeatureCardProps) {
  return (
    <div className="bg-[#282828] rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#1DE954] mb-3">{title}</h3>
      <p className="text-gray-300 mb-5">{description}</p>
      <Link
        href={link}
        className="text-[#1DE954] font-semibold hover:underline"
      >
        Learn more →
      </Link>
    </div>
  );
}
