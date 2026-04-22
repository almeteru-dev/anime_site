"use client"

import { useState } from "react"
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface GallerySectionProps {
  images: {
    src: string
    alt: string
  }[]
}

export function GallerySection({ images }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-[#00E5FF]" />
          <h2 className="text-xl font-bold text-white">Gallery</h2>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-video rounded-xl overflow-hidden border border-[#1A2847] group cursor-pointer shadow-[inset_0_2px_10px_rgba(0,229,255,0.05)] hover:shadow-[0_0_25px_rgba(0,229,255,0.2)] transition-all duration-300"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#040D1F]/0 group-hover:bg-[#040D1F]/30 transition-colors duration-300" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00E5FF]/50 rounded-xl transition-colors duration-300" />
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-[#040D1F]/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#081229] border border-[#1A2847] text-white hover:bg-[#0D1A3A] hover:border-[#00E5FF]/50 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevious() }}
              className="absolute left-4 p-3 rounded-full bg-[#081229] border border-[#1A2847] text-white hover:bg-[#0D1A3A] hover:border-[#00E5FF]/50 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleNext() }}
              className="absolute right-4 p-3 rounded-full bg-[#081229] border border-[#1A2847] text-white hover:bg-[#0D1A3A] hover:border-[#00E5FF]/50 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <div 
              className="relative max-w-4xl max-h-[80vh] w-full aspect-video rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                fill
                className="object-contain"
              />
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#081229] px-4 py-2 rounded-full border border-[#1A2847]">
              <span className="text-[#00E5FF] font-semibold">{selectedIndex + 1}</span>
              <span className="text-[#A3CFFF]"> / {images.length}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
