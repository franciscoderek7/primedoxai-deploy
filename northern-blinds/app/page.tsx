import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronRight, MapPin, Shield, Clock, Star } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import ProductCategories from '@/components/home/ProductCategories';
import ServiceAreas from '@/components/home/ServiceAreas';
import NorthernAITeaser from '@/components/home/NorthernAITeaser';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import TrustBar from '@/components/home/TrustBar';

export const metadata: Metadata = {
  title: 'Northern Blinds — Custom Blinds, Windows & Doors | Kawarthas & Muskoka',
  description:
    'Custom blinds, shades, windows, and doors for Northern Ontario. Expert measurement and installation serving Kawarthas, Muskoka, Peterborough and surrounding areas. Book your free consultation.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ProductCategories />
      <NorthernAITeaser />
      <ServiceAreas />
      <ConsultationCTA />
    </>
  );
}
