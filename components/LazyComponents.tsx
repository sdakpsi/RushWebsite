import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load heavy components with loading fallbacks
export const LazyApplicationPopUp = dynamic(
  () => import('@/components/ApplicationPopUp'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyApplicantCard = dynamic(
  () => import('@/components/ApplicantCard'),
  {
    loading: () => <div className="animate-pulse h-32 bg-gray-700 rounded-lg" />,
    ssr: true,
  }
);

export const LazyProspectCard = dynamic(
  () => import('@/components/ProspectCard'),
  {
    loading: () => <div className="animate-pulse h-32 bg-gray-700 rounded-lg" />,
    ssr: true,
  }
);

export const LazyQueueView = dynamic(
  () => import('@/components/QueueView'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);