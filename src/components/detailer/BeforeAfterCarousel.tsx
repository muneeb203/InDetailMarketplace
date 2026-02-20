import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface BeforeAfterItem {
  id: string;
  before: string;
  after: string;
  caption: string;
  tags?: string[];
}

interface BeforeAfterCarouselProps {
  items: BeforeAfterItem[];
  onViewGallery?: () => void;
  className?: string;
}

export function BeforeAfterCarousel({
  items,
  onViewGallery,
  className,
}: BeforeAfterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  if (items.length === 0) {
    return (
      <div className={cn("bg-white rounded-2xl shadow-sm border p-8", className)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📸</span>
          </div>
          <h3 className="font-semibold text-gray-900">No portfolio photos yet</h3>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-900">Portfolio</h3>
          <button
            onClick={onViewGallery}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            <Maximize2 className="w-4 h-4" />
            <span>View Gallery</span>
          </button>
        </div>

        {/* Carousel - single portfolio image per slide */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
            {(currentItem.after || currentItem.before) ? (
              <img
                src={currentItem.after || currentItem.before}
                alt={currentItem.caption || 'Portfolio'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-6xl opacity-30">📸</span>
              </div>
            )}
          </div>

          {/* Caption & Tags */}
          <div className="mb-4">
            <p className="text-gray-900 font-medium mb-2">{currentItem.caption}</p>
            {currentItem.tags && currentItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "w-8 bg-blue-600"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
