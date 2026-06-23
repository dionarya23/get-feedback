import { Suspense } from 'react';
import AnnotateClient from './AnnotateClient';
import LoadingDots from '@/components/LoadingDots';

export const metadata = {
  title: 'Annotate | Get-Feedback',
};

export default function AnnotatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><LoadingDots /></div>}>
      <AnnotateClient />
    </Suspense>
  );
}
