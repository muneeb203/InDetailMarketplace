import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: string;
  before: string;
  after: string;
  caption: string;
  tags?: string[];
}

interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  initialIndex?: number;
}

export function GalleryLightbox({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
}: GalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseDetail = () => {
    setSelectedIndex(null);
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Gallery grid view */}
      {selectedIndex === null && (
        <div className="w-full h-full overflow-y-auto p-6 sm:p-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Portfolio Gallery</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => {
                const imgUrl = item.after || item.before;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(index)}
                    className="group relative bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {imgUrl ? (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={imgUrl} alt={item.caption} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <span className="text-4xl opacity-30">📸</span>
                      </div>
                    )}

                    {/* Zoom icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="p-4 text-left">
                      <p className="text-white font-medium line-clamp-2">{item.caption}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/80"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="px-2 py-0.5 text-xs text-white/60">
                              +{item.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detail view - full-size image(s) */}
      {selectedItem && (
        <div className="w-full h-full flex items-center justify-center p-6 overflow-auto">
          <button
            onClick={handleCloseDetail}
            className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
            aria-label="Back to grid"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-5xl w-full">
            {(selectedItem.after || selectedItem.before) ? (
              <div className="mb-6">
                <img
                  src={selectedItem.after || selectedItem.before}
                  alt={selectedItem.caption}
                  className="w-full rounded-2xl object-contain max-h-[70vh]"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mb-6">
                <span className="text-8xl opacity-30">📸</span>
              </div>
            )}

            {/* Caption & Tags */}
            <div className="text-center">
              <p className="text-white text-lg font-medium mb-3">{selectedItem.caption}</p>
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/10 text-sm text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
