'use client';

import { useState, useRef } from 'react';
import Toolbar from './Toolbar';
import { nanoid } from 'nanoid';
import * as htmlToImage from 'html-to-image';
import LoadingDots from './LoadingDots';

export type AnnotationMode = 'pin' | 'rectangle' | 'none';

export type Annotation = {
  id: string;
  type: AnnotationMode;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
};

export default function ImageAnnotator({ image }: { image: string }) {
  const [mode, setMode] = useState<AnnotationMode>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSharing, setIsSharing] = useState(false);
  const [sharedLink, setSharedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const getCoordinates = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

    const { x, y } = getCoordinates(e);

    if (mode === 'pin') {
      const newPin: Annotation = {
        id: nanoid(6),
        type: 'pin',
        x,
        y,
        text: ''
      };
      setAnnotations([...annotations, newPin]);
      setMode('none');
    } else if (mode === 'rectangle') {
      setIsDrawing(true);
      setCurrentRect({ x, y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || mode !== 'rectangle' || !currentRect) return;
    const { x, y } = getCoordinates(e);

    setCurrentRect({
      ...currentRect,
      w: x - currentRect.x,
      h: y - currentRect.y
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || mode !== 'rectangle' || !currentRect) return;
    setIsDrawing(false);

    const finalX = currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x;
    const finalY = currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y;
    const finalW = Math.abs(currentRect.w);
    const finalH = Math.abs(currentRect.h);

    if (finalW > 10 && finalH > 10) {
      setAnnotations([...annotations, {
        id: nanoid(6),
        type: 'rectangle',
        x: finalX,
        y: finalY,
        width: finalW,
        height: finalH
      }]);
    }

    setCurrentRect(null);
    setMode('none');
  };

  const handleTextChange = (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnnotations(annotations.map(a => a.id === id ? { ...a, text: e.target.value } : a));
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleDelete = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const handleReset = () => {
    setAnnotations([]);
    setMode('none');
  };

  const handleShare = async () => {
    if (!containerRef.current) return;
    setIsSharing(true);

    try {
      const imageBase64 = await htmlToImage.toJpeg(containerRef.current, {
        quality: 0.9,
        pixelRatio: 2, // Retain sharpness
        filter: (node) => {
          if (node instanceof Element && node.classList?.contains('exclude-from-capture')) {
            return false;
          }
          return true;
        }
      });

      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status} - Server Error`);
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setSharedLink(`${baseUrl}/v/${data.slug}`);
    } catch (err: any) {
      alert(`Failed to generate and share image.\nDetail: ${err.message}`);
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative">
      <Toolbar mode={mode} setMode={setMode} onReset={handleReset} onShare={handleShare} isSharing={isSharing} />

      <div
        id="annotate-canvas"
        ref={containerRef}
        className="relative inline-block border border-black shadow-sm select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: mode !== 'none' ? 'crosshair' : 'default' }}
      >
        <img src={image} alt="Screenshot" className="block max-w-full" draggable={false} />

        {annotations.map(ann => {
          if (ann.type === 'pin') {
            return (
              <div
                key={ann.id}
                className="absolute flex flex-col gap-1 z-10"
                style={{ left: ann.x, top: ann.y }}
              >
                <div className="w-4 h-4 bg-red-600 border border-black -translate-x-1/2 -translate-y-1/2" />
                <div className="relative">
                  <textarea
                    className="bg-white border border-black text-xs font-mono p-2 shadow-sm focus:outline-none resize-none text-black pr-6 overflow-hidden"
                    style={{ width: '160px', minHeight: '60px' }}
                    placeholder="Comment..."
                    value={ann.text || ''}
                    onChange={(e) => handleTextChange(ann.id, e)}
                    onMouseDown={(e) => e.stopPropagation()}
                    rows={2}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute top-0 right-0 bg-black text-white px-1.5 py-0.5 text-[10px] hover:bg-red-600 border-l border-b border-black cursor-pointer transition-colors exclude-from-capture"
                    title="Delete pin"
                  >
                    X
                  </button>
                </div>
              </div>
            );
          }
          if (ann.type === 'rectangle') {
            return (
              <div
                key={ann.id}
                className="absolute z-10"
                style={{ left: ann.x, top: ann.y }}
              >
                <div
                  className="absolute border-2 border-red-600 bg-red-600/20 pointer-events-none"
                  style={{ width: ann.width, height: ann.height }}
                />
                <div
                  className="absolute flex flex-col"
                  style={{ top: ann.height! + 4, left: 0 }}
                >
                  <div className="relative">
                    <textarea
                      className="bg-white border border-black text-xs font-mono p-2 shadow-sm focus:outline-none resize-none text-black pr-6 overflow-hidden"
                      style={{ width: '160px', minHeight: '60px' }}
                      placeholder="Comment..."
                      value={ann.text || ''}
                      onChange={(e) => handleTextChange(ann.id, e)}
                      onMouseDown={(e) => e.stopPropagation()}
                      rows={2}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute top-0 right-0 bg-black text-white px-1.5 py-0.5 text-[10px] hover:bg-red-600 border-l border-b border-black cursor-pointer transition-colors exclude-from-capture"
                      title="Delete rectangle"
                    >
                      X
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}

        {isDrawing && currentRect && (
          <div
            className="absolute border-2 border-red-600 bg-red-600/20 pointer-events-none z-20"
            style={{
              left: currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
              top: currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
              width: Math.abs(currentRect.w),
              height: Math.abs(currentRect.h)
            }}
          />
        )}
      </div>

      {isSharing && (
        <div className="fixed inset-0 bg-white/70 z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 border border-black bg-white p-6 shadow-sm">
             <LoadingDots />
             <span className="font-mono text-sm font-medium">Generating Link...</span>
          </div>
        </div>
      )}

      {sharedLink && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-black p-6 flex flex-col gap-4 max-w-sm w-full font-sans shadow-lg">
            <h3 className="font-serif font-bold text-xl">Feedback Link Ready!</h3>
            <p className="text-sm text-neutral-600">
              Send this link to the freelancer. They will see the final annotated image.
            </p>
            <input
              type="text"
              readOnly
              value={sharedLink}
              className="w-full p-2 border border-black text-xs font-mono bg-neutral-100 focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sharedLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`flex-1 py-2 border border-black transition-colors text-sm font-medium ${copied ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'}`}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => setSharedLink('')}
                className="py-2 px-4 bg-white text-black border border-black hover:bg-neutral-100 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
