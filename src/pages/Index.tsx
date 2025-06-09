import { useSeoMeta } from '@unhead/react';
import { ZaplyticsDashboard } from '@/components/zaplytics/ZaplyticsDashboard';

const Index = () => {
  useSeoMeta({
    title: 'Zaplytics - Track Your Nostr Zap Earnings',
    description: 'Analytics dashboard for Nostr content creators to track zap earnings, top content, and supporter insights.',
  });

  return <ZaplyticsDashboard />;
};

export default Index;
