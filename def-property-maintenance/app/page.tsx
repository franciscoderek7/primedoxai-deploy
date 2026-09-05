import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import TrustBar from '@/components/home/TrustBar';
import ServicesGrid from '@/components/home/ServicesGrid';
import Property360Teaser from '@/components/home/Property360Teaser';
import DEFAITeaser from '@/components/home/DEFAITeaser';
import ConsultationCTA from '@/components/home/ConsultationCTA';

export const metadata: Metadata = {
  title: 'DEF Property Maintenance — Cottage Country Property & Security Specialists',
  description:
    'Cottage country property maintenance, cottage care, security-focused services, and AI Property 360™ smart monitoring. Serving Kawarthas, Muskoka, and surrounding areas.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ServicesGrid />
      <Property360Teaser />
      <DEFAITeaser />
      <ConsultationCTA />
    </>
  );
}
