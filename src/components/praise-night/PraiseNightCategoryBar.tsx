import React from 'react';

interface PraiseNightCategoryBarProps {
  categoryFilter: string | null;
  pageParam: string | null;
  mainCategories: string[];
  activeCategory: string;
  handleCategorySelect: (category: string) => void;
  finalSongData: any[];
  zoneColor: string;
}

export const PraiseNightCategoryBar: React.FC<PraiseNightCategoryBarProps> = ({
  categoryFilter,
  pageParam,
  mainCategories,
  activeCategory,
  handleCategorySelect,
  finalSongData,
  zoneColor
}) => {
  const renderCategoryButtons = (isArchivePage: boolean) => (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        // Safe area for iPhone home indicator — works on all Safari versions
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(255,255,255,0.97)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        WebkitBackdropFilter: 'blur(12px)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Scroll container for buttons */}
      <div
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch' as any,
          scrollbarWidth: 'none' as any,
          msOverflowStyle: 'none' as any,
          padding: '8px 12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            minWidth: 'max-content',
          }}
        >
          {mainCategories.map((category) => {
            const hasActiveSong = finalSongData.some(
              (song: any) => song.category === category && song.isActive
            );
            const isActive = activeCategory === category;

            let bgColor = 'rgba(255,255,255,0.9)';
            let textColor = '#1e293b';
            let border = '1px solid #e2e8f0';
            let boxShadow = 'none';

            if (hasActiveSong) {
              bgColor = '#16a34a';
              textColor = '#ffffff';
              border = '2px solid #15803d';
              boxShadow = '0 2px 8px rgba(22,163,74,0.4)';
            } else if (isActive) {
              bgColor = zoneColor;
              textColor = '#ffffff';
              border = `1px solid ${zoneColor}`;
              boxShadow = `0 2px 8px ${zoneColor}50`;
            }

            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                style={{
                  flexShrink: 0,
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  backgroundColor: bgColor,
                  color: textColor,
                  border,
                  boxShadow,
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  transition: 'all 0.15s ease',
                  lineHeight: '1.2',
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (categoryFilter === 'archive' && pageParam) {
    return renderCategoryButtons(true);
  }

  if (categoryFilter !== 'archive') {
    return renderCategoryButtons(false);
  }

  return null;
};
