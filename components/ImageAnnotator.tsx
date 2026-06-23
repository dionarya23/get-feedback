'use client';

import { useState, useRef } from 'react';
import Toolbar from './Toolbar';
import { nanoid } from 'nanoid';

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

  return (
    <div className="relative">
      <Toolbar mode={mode} setMode={setMode} onReset={handleReset} />

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
                    className="absolute top-0 right-0 bg-black text-white px-1.5 py-0.5 text-[10px] hover:bg-red-600 border-l border-b border-black cursor-pointer transition-colors"
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
                      className="absolute top-0 right-0 bg-black text-white px-1.5 py-0.5 text-[10px] hover:bg-red-600 border-l border-b border-black cursor-pointer transition-colors"
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
    </div>
  );
}
