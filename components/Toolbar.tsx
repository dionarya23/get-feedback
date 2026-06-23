'use client';

import type { AnnotationMode } from './ImageAnnotator';

interface ToolbarProps {
  mode: AnnotationMode;
  setMode: (mode: AnnotationMode) => void;
  onReset: () => void;
  onShare?: () => void;
  isSharing?: boolean;
}

export default function Toolbar({ mode, setMode, onReset, onShare, isSharing }: ToolbarProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-black shadow-sm flex gap-2 p-2 font-sans">
      <button
        onClick={() => setMode(mode === 'pin' ? 'none' : 'pin')}
        className={`px-4 py-2 text-sm font-medium border border-black transition-colors ${mode === 'pin' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
      >
        Pin
      </button>
      <button
        onClick={() => setMode(mode === 'rectangle' ? 'none' : 'rectangle')}
        className={`px-4 py-2 text-sm font-medium border border-black transition-colors ${mode === 'rectangle' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
      >
        Rectangle
      </button>
      <div className="w-px bg-neutral-300 mx-1" />
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm font-medium bg-white text-black border border-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
      >
        Reset
      </button>
      <div className="w-px bg-neutral-300 mx-1" />
      <button
        onClick={onShare}
        disabled={isSharing}
        className="px-4 py-2 text-sm font-medium bg-black text-white border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-[160px]"
      >
        {isSharing ? 'Generating...' : 'Generate & Share'}
      </button>
    </div>
  );
}
