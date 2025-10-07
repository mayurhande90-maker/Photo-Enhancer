'use client';

import { useState, useRef, useId } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  className?: string;
  initialPosition?: number;
}

export function BeforeAfterSlider({ before, after, className, initialPosition = 50 }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden select-none group', className)}
    >
      <Image
        src={before}
        alt="Before"
        fill
        className="object-contain"
        priority
      />
      <div
        className="absolute top-0 left-0 right-0 bottom-0 w-full h-full overflow-hidden select-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={after}
          alt="After"
          fill
          className="object-contain"
          priority
        />
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        aria-labelledby={`slider-label-${id}`}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
      />

      <div
        className="absolute top-0 bottom-0 w-1 bg-white/50 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-0"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white/80 shadow-md grid place-items-center backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 12 12)"/>
            </svg>
        </div>
      </div>
      <div id={`slider-label-${id}`} className="sr-only">Image comparison slider</div>
    </div>
  );
}
