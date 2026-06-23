'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingDots from '@/components/LoadingDots';
import ImageAnnotator from '@/components/ImageAnnotator';

export default function AnnotateClient() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!url) {
      setError('No URL provided. Please return to the homepage and enter a URL.');
      setLoading(false);
      return;
    }

    const fetchScreenshot = async () => {
      try {
        const res = await fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch screenshot');
        
        setImage(data.image);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchScreenshot();
  }, [url]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white text-black font-sans">
        <div className="p-6 border border-black bg-white max-w-md w-full shadow-sm text-center">
          <h2 className="text-red-600 font-bold mb-2">Error</h2>
          <p className="text-sm mb-6">{error}</p>
          <a href="/" className="px-4 py-2 bg-black text-white border border-black hover:bg-white hover:text-black transition-colors inline-block text-sm font-medium">
            Go back
          </a>
        </div>
      </div>
    );
  }

  if (loading || !image) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-8 flex justify-center overflow-auto font-sans">
      <ImageAnnotator image={image} />
    </div>
  );
}
