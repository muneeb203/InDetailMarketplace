import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BeforeAfterPhoto } from '../types';

interface BeforeAfterCarouselProps {
  photos: BeforeAfterPhoto[];
  title?: string;
}

export function BeforeAfterCarousel({ photos, title = "Before & After Gallery" }: BeforeAfterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(true);

  if (photos.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <p className="text-center text-gray-500">No before/after photos available yet.</p>
      </Card>
    );
  }

  const currentPhoto = photos[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    setShowBefore(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    setShowBefore(true);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openLightbox(currentIndex)}
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            View Full Gallery
          </Button>
        </div>

        <Card className="overflow-hidden border-2 border-blue-100">
          {/* Main Carousel */}
          <div className="relative">
            {/* Image Container with Toggle */}
            <div className="relative h-80 bg-gray-100">
              <ImageWithFallback
                src={showBefore ? currentPhoto.beforeUrl : currentPhoto.afterUrl}
                alt={showBefore ? "Before" : "After"}
                className="w-full h-full object-cover"
              />
              
              {/* Before/After Badge */}
              <div className="absolute top-4 left-4">
                <div className={`px-4 py-2 rounded-full font-medium ${
                  showBefore 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {showBefore ? 'Before' : 'After'}
                </div>
              </div>

              {/* Toggle Button */}
              <Button
                onClick={() => setShowBefore(!showBefore)}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-gray-900 shadow-lg"
              >
                {showBefore ? 'Show After' : 'Show Before'}
              </Button>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <Button
                    onClick={handlePrev}
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Photo Info */}
            {currentPhoto.description && (
              <div className="p-4 bg-white border-t">
                <p className="text-sm text-gray-700">{currentPhoto.description}</p>
                {currentPhoto.category && (
                  <p className="text-xs text-gray-500 mt-1">{currentPhoto.category}</p>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {photos.length > 1 && (
            <div className="p-3 bg-gray-50 border-t overflow-x-auto">
              <div className="flex gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      setShowBefore(true);
                    }}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <ImageWithFallback
                      src={photo.afterUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Counter */}
          <div className="text-center py-2 text-sm text-gray-500 bg-white border-t">
            {currentIndex + 1} of {photos.length}
          </div>
        </Card>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <h3>Before & After Gallery</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Lightbox Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {photos.map((photo) => (
                  <div key={photo.id} className="space-y-3">
                    {/* Before */}
                    <Card className="overflow-hidden">
                      <div className="relative">
                        <ImageWithFallback
                          src={photo.beforeUrl}
                          alt="Before"
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                          Before
                        </div>
                      </div>
                    </Card>
                    
                    {/* After */}
                    <Card className="overflow-hidden">
                      <div className="relative">
                        <ImageWithFallback
                          src={photo.afterUrl}
                          alt="After"
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          After
                        </div>
                      </div>
                    </Card>

                    {photo.description && (
                      <p className="text-sm text-gray-700 px-1">{photo.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
