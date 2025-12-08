import React, { useRef, useEffect, useState } from 'react';
import { PortfolioItem } from '../types';
import PortfolioItemCard from './PortfolioItemCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryCarouselProps {
  items: PortfolioItem[];
  onViewItem: (item: PortfolioItem) => void;
  onDeleteItem: (id: string) => void;
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ items, onViewItem, onDeleteItem }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update layout metrics on resize
  useEffect(() => {
    const updateMetrics = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', updateMetrics);
    updateMetrics();

    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  // Track scroll position to calculate distance from center for each card
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollProgress(scrollContainerRef.current.scrollLeft);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // 30vw item width + 24px gap approx
      const itemWidth = (window.innerWidth * 0.3) + 24;
      const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;
      
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full h-full relative flex items-center bg-black/20 group">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory hide-scrollbar pt-20 pb-20"
        style={{ 
            scrollBehavior: 'smooth',
            paddingLeft: '35vw',
            paddingRight: '35vw'
        }}
      >
        {items.map((item, index) => {
          const itemWidthVw = 30;
          const itemWidthPx = (window.innerWidth * itemWidthVw) / 100;
          const gap = 24; 
          
          // Calculate center positions logic
          const itemAbsolutePos = (index * (itemWidthPx + gap)); 
          const distanceFromCenter = scrollProgress - itemAbsolutePos;
          let distanceFactor = distanceFromCenter / (itemWidthPx * 1.0);
          distanceFactor = Math.max(-2, Math.min(2, distanceFactor));
          
          return (
            <div 
              key={item.id} 
              // Added hover:z-[100] to ensure the hovered card is ALWAYS on top, allowing buttons to be clicked
              className="flex-shrink-0 w-[30vw] h-[60vh] mr-6 last:mr-0 snap-center perspective-1000 transition-all duration-300 hover:z-[100] relative"
              style={{
                 zIndex: Math.round(10 - Math.abs(distanceFactor))
              }}
            >
              <PortfolioItemCard 
                item={item}
                onClick={onViewItem}
                onDelete={onDeleteItem}
                offsetFactor={distanceFactor} 
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-12 z-50 pointer-events-none">
        <button 
          onClick={() => scroll('left')}
          className="pointer-events-auto p-4 rounded-full border border-white/20 bg-black/60 text-white hover:bg-[#9D00FF]/20 hover:border-[#9D00FF] hover:scale-110 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
        >
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="pointer-events-auto p-4 rounded-full border border-white/20 bg-black/60 text-white hover:bg-[#9D00FF]/20 hover:border-[#9D00FF] hover:scale-110 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
        >
            <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default GalleryCarousel;