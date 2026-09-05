import type { Metadata } from 'next';
import NorthernAIChat from '@/components/northern-ai/NorthernAIChat';

export const metadata: Metadata = {
  title: 'Northern AI — Ask Your Window & Door Expert',
  description:
    'Get instant expert answers on blinds, windows, and doors. Northern AI helps you understand your options before your free consultation.',
};

export default function NorthernAIPage() {
  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: 'var(--nb-night)' }}
    >
      <NorthernAIChat />
    </div>
  );
}
