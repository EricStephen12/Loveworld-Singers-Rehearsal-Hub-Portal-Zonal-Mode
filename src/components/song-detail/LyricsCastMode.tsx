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
  zoneColor = '#4C068E',
  onClose,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(42);
  const [allWhite, setAllWhite] = useState(false);
  const [activePara, setActivePara] = useState<number>(-1);
  const [customColor, setCustomColor] = useState<string>('#4C068E');
  const [paraCount, setParaCount] = useState(0);
  const [boldOnlyIndices, setBoldOnlyIndices] = useState<Set<number>>(new Set());
  const paraRefsMap = useRef<HTMLElement[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const MIN_FONT = 20;
  const MAX_FONT = 80;
  const containerRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Parse lyrics into lines — only after mount so document is available
  const lyricLines = React.useMemo(() => {
    if (!mounted || !lyrics) return [];
    try {
      const div = document.createElement('div');
      div.innerHTML = lyrics;
      const paras = Array.from(div.querySelectorAll('p'));
      const result: { text: string; isBold: boolean }[] = [];
      paras.forEach(p => {
        const text = (p.textContent || '').replace(/\u00a0/g, '').trim();
        if (!text) return;
        const isBold = Array.from(p.childNodes).every(node => {
          if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/\u00a0/g, '').trim() === '';
          if (node.nodeType === Node.ELEMENT_NODE) return ['B', 'STRONG'].includes((node as Element).tagName);
          return true;
        });
        result.push({ text, isBold });
      });
      return result;
    } catch { return []; }
  }, [mounted, lyrics]);

  // After lyrics render, walk the DOM and make each <p> tappable
  // Also hide bold tags that only contain whitespace/nbsp (CSS :empty can't catch those)
  useEffect(() => {
    if (!mounted) return;
    // Small delay to ensure dangerouslySetInnerHTML has fully painted
    const timer = setTimeout(() => {
    if (!lyricsRef.current) return;
    const paras = Array.from(lyricsRef.current.querySelectorAll('p'));

    // First pass: hide empty bold/strong tags
    const boldTags = Array.from(lyricsRef.current.querySelectorAll('b, strong'));
    boldTags.forEach(el => {
      const text = (el.textContent || '').replace(/\u00a0/g, '').trim();
      if (!text) (el as HTMLElement).style.display = 'none';
    });

    // Second pass: process each <p> — hide empty ones, style the rest
    paras.forEach(p => {
      const text = (p.textContent || '').replace(/\u00a0/g, '').trim();
      const onlyEmptyOrBr = Array.from(p.childNodes).every(node => {
        if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/\u00a0/g, '').trim() === '';
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          return el.tagName === 'BR' || (el.style.display === 'none') || (el.textContent || '').replace(/\u00a0/g, '').trim() === '';
        }
        return true;
      });
      if (!text || onlyEmptyOrBr) {
        (p as HTMLElement).style.display = 'none';
        return;
      }

      // Check if paragraph is a bold-label-only line (VERSE, CHORUS, All: etc.)
      const isBoldOnly = Array.from(p.childNodes).every(node => {
        if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/\u00a0/g, '').trim() === '';
        if (node.nodeType === Node.ELEMENT_NODE) return ['B', 'STRONG'].includes((node as HTMLElement).tagName);
        return true;
      });

      if (isBoldOnly) {
        // No wrapper styling — the <b> box already provides the visual container
        (p as HTMLElement).style.cursor = 'default';
        (p as HTMLElement).style.borderRadius = '0';
        (p as HTMLElement).style.padding = '0';
        (p as HTMLElement).style.marginTop = '10px';
        (p as HTMLElement).style.marginBottom = '4px';
        (p as HTMLElement).style.transition = 'none';
      } else {
        // Regular lyric lines get the tap highlight treatment
        (p as HTMLElement).style.cursor = 'pointer';
        (p as HTMLElement).style.borderRadius = '6px';
        (p as HTMLElement).style.padding = '2px 6px';
        (p as HTMLElement).style.transition = 'background 0.15s, opacity 0.15s';
      }
    });

    // Register click handlers only on visible paras
    const visibleParas = paras.filter(p => (p as HTMLElement).style.display !== 'none');
    paraRefsMap.current = visibleParas.map(p => p as HTMLElement);

    // Track which visible paras are bold-only (section labels)
    const boldSet = new Set<number>();
    visibleParas.forEach((p, i) => {
      const isBoldOnly = Array.from(p.childNodes).every(node => {
        if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/\u00a0/g, '').trim() === '';
        if (node.nodeType === Node.ELEMENT_NODE) return ['B', 'STRONG'].includes((node as HTMLElement).tagName);
        return true;
      });
      if (isBoldOnly) boldSet.add(i);
    });
    setBoldOnlyIndices(boldSet);
    setParaCount(visibleParas.length);
    visibleParas.forEach((p, i) => {
      (p as HTMLElement).onclick = () => setActivePara(prev => prev === i ? -1 : i);
    });

    }, 200); // end setTimeout

    return () => {
      clearTimeout(timer);
    };
  }, [mounted, lyrics]);

  // Apply highlight styles to paragraphs when activePara changes
  useEffect(() => {
    if (!lyricsRef.current) return;
    const paras = Array.from(lyricsRef.current.querySelectorAll('p')).filter(
      p => (p as HTMLElement).style.display !== 'none'
    );
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

  const bg = customColor;
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
        className="flex items-center justify-between px-3 py-1.5 flex-shrink-0 border-b border-white/10"
        style={{ maxHeight: 48 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {imageUrl && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              width={48}
              height={36}
              className="rounded-lg object-cover flex-shrink-0"
              style={{ width: 36, height: 36 }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg flex-shrink-0 bg-white/20" style={{ width: 36, height: 36 }}>
              <Music className="w-4 h-4 text-white/80" />
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <p className="text-white font-semibold truncate" style={{ fontSize: 13, maxWidth: '45vw' }}>{title}</p>
            )}
            {writer && (
              <p className="text-white/70 truncate" style={{ fontSize: 11, maxWidth: '45vw' }}>{writer}</p>
            )}
          </div>
        </div>

        {/* Dot Navigator in header — horizontal scroll */}
        {lyricLines.length > 0 && (
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide mx-2">
            {lyricLines.map((line, i) => {
              const isActive = activePara === i;
              const isLabel = line.isBold;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setActivePara(i);
                    const el = paraRefsMap.current[i];
                    if (el && scrollRef.current) {
                      scrollRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
                    }
                  }}
                  style={{
                    width: isActive ? 12 : isLabel ? 9 : 7,
                    height: isActive ? 12 : isLabel ? 9 : 7,
                    minWidth: isActive ? 12 : isLabel ? 9 : 7,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isActive ? '#FFD700' : isLabel ? 'rgba(255,215,0,0.7)' : 'rgba(255,255,255,0.5)',
                    boxShadow: isActive ? '0 0 6px #FFD700' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    outline: 'none',
                    transition: 'all 0.15s',
                  }}
                  aria-label={`Line ${i + 1}`}
                />
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Color picker */}
          <button
            onClick={() => colorInputRef.current?.click()}
            aria-label="Change background color"
            title="Change background color"
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors overflow-hidden relative"
            style={{ width: 32, height: 32 }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white/60"
              style={{ background: customColor }}
            />
            <input
              ref={colorInputRef}
              type="color"
              defaultValue={customColor}
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
              width: 32, height: 32,
              background: allWhite ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              color: allWhite ? '#000' : '#fff',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700 }}>A</span>
          </button>
          <button
            onClick={() => setFontSize(s => Math.max(s - 4, MIN_FONT))}
            aria-label="Zoom out"
            disabled={fontSize <= MIN_FONT}
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30"
            style={{ width: 32, height: 32 }}
          >
            <ZoomOut className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={() => setFontSize(s => Math.min(s + 4, MAX_FONT))}
            aria-label="Zoom in"
            disabled={fontSize >= MAX_FONT}
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30"
            style={{ width: 32, height: 32 }}
          >
            <ZoomIn className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={onClose}
            aria-label="Exit Cast Mode"
            className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            style={{ width: 32, height: 32 }}
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Lyrics + Dot Navigator */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lyrics scroll area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >
          <div className="max-w-3xl mx-auto">
            {hasLyrics ? (
              <div
                ref={lyricsRef}
                dangerouslySetInnerHTML={{ __html: lyrics! }}
                className="cast-lyrics max-w-none"
                style={{ fontSize, lineHeight: 1.3 }}
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
      </div>

      {/* Force all text white, keep original spacing */}
      <style>{`
        .cast-lyrics,
        .cast-lyrics p,
        .cast-lyrics span,
        .cast-lyrics em,
        .cast-lyrics h1,
        .cast-lyrics h2,
        .cast-lyrics h3,
        .cast-lyrics h4 {
          color: ${allWhite ? '#ffffff' : 'rgba(255,255,255,0.85)'} !important;
          font-weight: 700 !important;
          background: transparent !important;
        }
        .cast-lyrics h1, .cast-lyrics h2, .cast-lyrics h3, .cast-lyrics h4 {
          font-size: inherit !important;
          margin-top: 1.2em !important;
          margin-bottom: 0.3em !important;
        }

        /* Bold tags get a standout highlight box */
        .cast-lyrics strong,
        .cast-lyrics b {
          color: #ffffff !important;
          font-weight: 800 !important;
          background: rgba(255, 255, 255, 0.18) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.45) !important;
          border-radius: 6px !important;
          padding: 0px 4px !important;
          font-size: 0.75em !important;
          line-height: 1 !important;
          display: inline !important;
          vertical-align: middle !important;
          box-decoration-break: clone !important;
          -webkit-box-decoration-break: clone !important;
        }
        /* Paragraphs that only contain bold labels get breathing room between them */
        .cast-lyrics p {
          margin-bottom: 0.15em !important;
          margin-top: 0 !important;
        }
        /* Give bold-label-only paragraphs extra top margin so boxes don't overlap */
        .cast-lyrics p:has(> b:only-child),
        .cast-lyrics p:has(> strong:only-child) {
          margin-top: 0.5em !important;
          margin-bottom: 0.25em !important;
        }
        /* Hide empty bold tags (no visible text, just whitespace/nbsp) */
        .cast-lyrics strong:empty,
        .cast-lyrics b:empty {
          display: none !important;
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
};

export default LyricsCastMode;
