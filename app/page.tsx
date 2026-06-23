import UrlInput from '@/components/UrlInput';

export const metadata = {
  title: 'Get-Feedback | Visual Feedback Tool',
  description: 'Visual feedback tool for freelancers. Paste a URL, annotate, and share.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white text-black font-sans">
      <main className="w-full max-w-md border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-black">Get-Feedback</h1>
          <p className="font-sans text-neutral-600 text-sm leading-relaxed">
            Paste a website URL below to start annotating.
          </p>
        </div>
        
        <UrlInput />
      </main>
    </div>
  );
}
