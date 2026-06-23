'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('URL cannot be empty.');
      return;
    }

    try {
      // Basic URL validation
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      const parsedUrl = new URL(formattedUrl);
      
      // Redirect to annotation page
      router.push(`/annotate?url=${encodeURIComponent(parsedUrl.toString())}`);
    } catch (err) {
      setError('Please enter a valid URL.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-4">
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full py-2 border-b-2 border-black focus:outline-none font-mono text-sm bg-transparent placeholder-neutral-400"
        />
        {error && <p className="text-red-600 text-xs font-sans mt-1">{error}</p>}
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-black text-white font-sans font-medium border border-black hover:bg-white hover:text-black transition-colors"
      >
        Capture
      </button>
    </form>
  );
}
