"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Function to handle scroll events
    function handleScroll() {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    
    // Add event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once to initialize
    handleScroll();
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#282828]/95 backdrop-blur-md shadow-md py-2' 
        : 'bg-[#282828] py-4'
    }`}>
      <div className="container mx-auto px-4 flex flex-wrap justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-[#1DE954] transition-transform duration-300 hover:scale-105">
            BioScout Islamabad
          </h1>
        </Link>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span 
              className={`block h-0.5 w-full bg-white transition-all duration-300 ${
                mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`} 
            />
            <span 
              className={`block h-0.5 bg-white transition-opacity duration-300 ${
                mobileMenuOpen ? 'opacity-0 w-0' : 'w-full'
              }`} 
            />
            <span 
              className={`block h-0.5 w-full bg-white transition-all duration-300 ${
                mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`} 
            />
          </div>
        </button>
        
        {/* Navigation - Desktop */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <NavItem href="/" isActive={pathname === '/'}>Home</NavItem>
            <NavItem href="/observations" isActive={pathname === '/observations' || pathname.startsWith('/observations/')}>
              Observations
            </NavItem>
            <NavItem href="/ask" isActive={pathname === '/ask'}>Ask AI</NavItem>
          </ul>
        </nav>
      </div>
      
      {/* Mobile Navigation */}
      <nav 
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col items-center py-4 bg-[#282828]/95 backdrop-blur-md space-y-3">
          <NavItem href="/" isActive={pathname === '/'} isMobile>Home</NavItem>
          <NavItem href="/observations" isActive={pathname === '/observations' || pathname.startsWith('/observations/')} isMobile>
            Observations
          </NavItem>
          <NavItem href="/ask" isActive={pathname === '/ask'} isMobile>Ask AI</NavItem>
        </ul>
      </nav>
    </header>
  );
}

interface NavItemProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  isMobile?: boolean;
}

function NavItem({ href, isActive, children, isMobile = false }: NavItemProps) {
  return (
    <li className="relative">
      <Link 
        href={href} 
        className={`block px-3 py-2 transition-all duration-300 ${
          isActive 
            ? 'text-[#1DE954]' 
            : 'text-white hover:text-[#1DE954]'
        } ${isMobile ? 'text-lg' : ''}`}
      >
        {children}
        <span 
          className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#1DE954] transform origin-left transition-transform duration-300 ${
            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </Link>
    </li>
  );
}