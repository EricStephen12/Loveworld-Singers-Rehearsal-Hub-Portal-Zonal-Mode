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

/**
 * Extracts plain text lines from HTML lyrics, preserving line breaks
 * from <br>, <p>, and <div> elements.
 */
function parseLyricsToLines(html: string | null | undefined): string[] {
  if (!html) return [];

  const withNewlines = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n');

  let plainText: string;
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(withNewlines, 'text/html');
    plainText = doc.body.textContent ?? '';
  } else {
    plainText = withNewlines.replace(/<[^>]*>/g, '');
  }

  return plainText
    .split('\n')
    .map(line => line.trim())
    .filter(line => /\S/.test(line));
}

/**
 * Derives a radial gradient background from a hex zone color.
 * Falls back to a dark navy if the color is invalid.
 */
function deriveCastBackground(hex: string | null | undefined): string {
  const FALLBACK = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
  if (!hex) return FALLBACK;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return FALLBACK;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

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

  const tintL = Math.min(lBase + 15, 55);
  const shadeL = Math.max(lBase - 25, 10);

  const tint = `hsl(${hDeg}, ${sPct}%, ${tintL}%)`;
  const shade = `hsl(${hDeg}, ${Math.max(sPct, 70)}%, ${shadeL}%)`;

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
  const lines = parseLyricsToLines(lyrics);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(42);
  const [allWhite, setAllWhite] = useState(false);
  const MIN_FONT = 20;
  const MAX_FONT = 80;
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartY = useRef<number | null>(null);

  // Mount guard for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus container on open + suppress background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const nextEl = document.getElementById('__next');
    if (nextEl) nextEl.setAttribute('aria-hidden', 'true');

    const timer = setTimeout(() => {
      containerRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      if (nextEl) nextEl.removeAttribute('aria-hidden');
    };
  }, []);

  // Intercept back button / Escape
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, lines.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, lines.length]);

  // Scroll active line into view
  useEffect(() => {
    lineRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeIndex]);

  // Touch swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta >= 20) {
      setActiveIndex(i => Math.min(i + 1, lines.length - 1));
    } else if (delta <= -20) {
      setActiveIndex(i => Math.max(i - 1, 0));
    }
    touchStartY.current = null;
  };

  if (!mounted) return null;

  const bg = deriveCastBackground(zoneColor);

  const content = (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-label="Cast Mode Lyrics Display"
      className="fixed inset-0 z-[9999] flex flex-col outline-none overflow-hidden"
      style={{ background: bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ maxHeight: 72 }}>
        {/* Song identity */}
        <div className="flex items-center gap-3 min-w-0">
          {imageUrl && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              width={56}
              height={56}
              className="rounded-lg object-cover flex-shrink-0"
              style={{ width: 56, height: 56 }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0 bg-white/20"
              style={{ width: 56, height: 56 }}
            >
              <Music className="w-7 h-7 text-white/80" />
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <p className="text-white font-semibold truncate" style={{ fontSize: 16, maxWidth: '55vw' }}>
                {title}
              </p>
            )}
            {writer && (
              <p className="text-white/70 truncate" style={{ fontSize: 13, maxWidth: '55vw' }}>
                {writer}
              </p>
            )}
          </div>
        </div>

        {/* Right controls: all-white toggle + zoom + exit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* All white toggle */}
          <button
            onClick={() => setAllWhite(v => !v)}
            aria-label={allWhite ? 'Disable all white' : 'All lines white'}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{
              width: 40,
              height: 40,
              background: allWhite ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              color: allWhite ? '#000' : '#fff',
            } as React.CSSProperties}
            title={allWhite ? 'Disable all white' : 'All lines white'}
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

      {/* Lyrics content */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-hide">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Music className="w-16 h-16 text-white/40" />
            <p
              className="text-white/60 text-center font-semibold"
              style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
            >
              No lyrics available
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 py-4 max-w-3xl mx-auto">
            {lines.map((line, i) => (
              <button
                key={i}
                ref={el => { lineRefs.current[i] = el; }}
                onClick={() => setActiveIndex(i)}
                className="text-left w-full transition-all duration-200 rounded-lg px-4 py-1.5"
                style={{
                  fontSize: fontSize,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: allWhite ? '#ffffff' : (i === activeIndex ? '#ffffff' : 'rgba(255,255,255,0.55)'),
                  background: (!allWhite && i === activeIndex) ? 'rgba(255,255,255,0.18)' : 'transparent',
                  transform: i === activeIndex ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'left center',
                }}
              >
                {line}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom hint — hidden in all-white mode */}
      {!allWhite && (
        <div className="flex-shrink-0 pb-4 flex justify-center">
          <p className="text-white/30 text-xs">
            Tap a line · ↑↓ arrows · swipe to navigate
          </p>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default LyricsCastMode;
