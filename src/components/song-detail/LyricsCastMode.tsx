"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Music, ZoomIn, ZoomOut } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LyricsCastModeProps {
  lyrics?: string;
  title?: string;
  writer?: string;
  imageUrl?: string;
  zoneColor?: string;
  onClose: () => void;
}

function deriveCastBackground(hex: string | null | undefined): string {
  const FALLBACK = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
  if (!hex) return FALLBACK;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return FALLBACK;
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(Math.max(s * 100, 60));
  const lBase = Math.round(l * 100);
  const tint = `hsl(${hDeg}, ${sPct}%, ${Math.min(lBase + 15, 55)}%)`;
  const shade = `hsl(${hDeg}, ${Math.max(sPct, 70)}%, ${Math.max(lBase - 25, 10)}%)`;
  return `radial-gradient(ellipse at 30% 20%, ${tint} 0%, ${hex} 45%, ${shade} 100%)`;
}

export const LyricsCastMode: React.FC<LyricsCastModeProps> = ({
  lyrics,
  title,
  writer,
  imageUrl,
  zoneColor = '#9333EA',
  onClose,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(42);
  const [allWhite, setAllWhite] = useState(false);
  const [activePara, setActivePara] = useState<number>(-1);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const MIN_FONT = 20;
  const MAX_FONT = 80;
  const containerRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // After lyrics render, walk the DOM and make each <p> tappable
  useEffect(() => {
    if (!lyricsRef.current) return;
    const paras = Array.from(lyricsRef.current.querySelectorAll('p'));
    
    paras.forEach((p, i) => {
      (p as HTMLElement).style.cursor = 'pointer';
      (p as HTMLElement).style.borderRadius = '6px';
      (p as HTMLElement).style.padding = '2px 6px';
      (p as HTMLElement).style.transition = 'background 0.15s, opacity 0.15s';
      (p as HTMLElement).onclick = () => setActivePara(prev => prev === i ? -1 : i);
    });

    return () => {
      paras.forEach(p => { (p as HTMLElement).onclick = null; });
    };
  }, [mounted, lyrics]);

  // Apply highlight styles to paragraphs when activePara changes
  useEffect(() => {
    if (!lyricsRef.current) return;
    const paras = Array.from(lyricsRef.current.querySelectorAll('p'));
    paras.forEach((p, i) => {
      if (i === activePara) {
        (p as HTMLElement).style.background = 'rgba(255,255,255,0.2)';
        (p as HTMLElement).style.opacity = '1';
        (p as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        (p as HTMLElement).style.background = 'transparent';
        (p as HTMLElement).style.opacity = allWhite ? '1' : '0.75';
      }
    });
  }, [activePara, allWhite, mounted]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const nextEl = document.getElementById('__next');
    if (nextEl) nextEl.setAttribute('aria-hidden', 'true');
    const timer = setTimeout(() => containerRef.current?.focus(), 50);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      if (nextEl) nextEl.removeAttribute('aria-hidden');
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const bg = customColor ?? zoneColor ?? '#9333EA';
  const hasLyrics = lyrics && lyrics.trim().length > 0;

  const content = (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-label="Cast Mode Lyrics Display"
      className="fixed inset-0 z-[9999] flex flex-col outline-none overflow-hidden"
      style={{ background: bg }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/10"
        style={{ maxHeight: 72 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {imageUrl && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              width={48}
              height={48}
              className="rounded-lg object-cover flex-shrink-0"
              style={{ width: 48, height: 48 }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg flex-shrink-0 bg-white/20" style={{ width: 48, height: 48 }}>
              <Music className="w-6 h-6 text-white/80" />
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <p className="text-white font-semibold truncate" style={{ fontSize: 15, maxWidth: '45vw' }}>{title}</p>
            )}
            {writer && (
              <p className="text-white/70 truncate" style={{ fontSize: 12, maxWidth: '45vw' }}>{writer}</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Color picker */}
          <button
            onClick={() => colorInputRef.current?.click()}
            aria-label="Change background color"
            title="Change background color"
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors overflow-hidden relative"
            style={{ width: 40, height: 40 }}
          >
            {/* Show current color as a circle swatch */}
            <div
              className="w-5 h-5 rounded-full border-2 border-white/60"
              style={{ background: customColor || zoneColor }}
            />
            <input
              ref={colorInputRef}
              type="color"
              defaultValue={zoneColor}
              onChange={e => setCustomColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-hidden="true"
            />
          </button>
          <button
            onClick={() => setAllWhite(v => !v)}
            aria-label={allWhite ? 'Disable all white' : 'All text white'}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{
              width: 40, height: 40,
              background: allWhite ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              color: allWhite ? '#000' : '#fff',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>A</span>
          </button>
          <button
            onClick={() => setFontSize(s => Math.max(s - 4, MIN_FONT))}
            aria-label="Zoom out"
            disabled={fontSize <= MIN_FONT}
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30"
            style={{ width: 40, height: 40 }}
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setFontSize(s => Math.min(s + 4, MAX_FONT))}
            aria-label="Zoom in"
            disabled={fontSize >= MAX_FONT}
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30"
            style={{ width: 40, height: 40 }}
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onClose}
            aria-label="Exit Cast Mode"
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            style={{ width: 44, height: 44 }}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Lyrics — raw HTML, same as original view */}
      <div
        className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
      >
        <div className="max-w-3xl mx-auto">
          {hasLyrics ? (
            <div
              ref={lyricsRef}
              dangerouslySetInnerHTML={{ __html: lyrics! }}
              className="cast-lyrics prose prose-slate prose-lg max-w-none"
              style={{ fontSize, lineHeight: 1.7 }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Music className="w-16 h-16 text-white/40" />
              <p className="text-white/60 text-center font-semibold" style={{ fontSize }}>
                No lyrics available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="flex-shrink-0 pb-3 flex justify-center">
        <p className="text-white/30 text-xs">
          Tap a line to highlight · scroll to navigate · zoom to resize
        </p>
      </div>

      {/* Force all text white, keep original spacing */}
      <style>{`
        .cast-lyrics,
        .cast-lyrics p,
        .cast-lyrics span,
        .cast-lyrics strong,
        .cast-lyrics b,
        .cast-lyrics em,
        .cast-lyrics h1,
        .cast-lyrics h2,
        .cast-lyrics h3,
        .cast-lyrics h4 {
          color: ${allWhite ? '#ffffff' : 'rgba(255,255,255,0.85)'} !important;
          font-weight: 700 !important;
          background: transparent !important;
        }
        .cast-lyrics p { margin-bottom: 0.4em !important; }
        .cast-lyrics h1, .cast-lyrics h2, .cast-lyrics h3, .cast-lyrics h4 {
          font-size: inherit !important;
          margin-top: 1.2em !important;
          margin-bottom: 0.3em !important;
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
};

export default LyricsCastMode;
