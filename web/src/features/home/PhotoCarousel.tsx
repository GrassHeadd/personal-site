"use client";

import Image from "next/image";
import { useState } from "react";

const photos = [
  { src: "/photos/snowy-woods.jpg", alt: "Junjie sitting in a snowy forest", position: "center 43%" },
  { src: "/photos/ferry.jpg", alt: "Junjie looking out from a ferry", position: "center" },
  { src: "/photos/bridge.jpg", alt: "Junjie by a bridge at night", position: "center" },
  { src: "/photos/camera.jpg", alt: "Junjie holding a camera in the city", position: "center" },
  { src: "/photos/cats.jpg", alt: "Junjie with two orange cats", position: "center 30%" },
  { src: "/photos/torii.jpg", alt: "Junjie beneath red torii gates", position: "center 35%" },
  { src: "/photos/yellowstone.jpg", alt: "Junjie at a scenic overlook", position: "center 35%" },
  { src: "/photos/snow-lake.jpg", alt: "Junjie posing on a frozen lake", position: "center 60%" },
];

export default function PhotoCarousel() {
  const [active, setActive] = useState(0);
  const previous = (active - 1 + photos.length) % photos.length;
  const next = (active + 1) % photos.length;

  return (
    <div className="flex flex-col items-center justify-center" aria-label="Photos of Junjie">
      <div className="relative h-72 w-72 md:h-80 md:w-80">
        <button
          type="button"
          onClick={() => setActive(previous)}
          className="absolute left-0 top-12 z-20 w-24 rounded-sm border border-pencil bg-paper p-1 pb-3 shadow-[2px_5px_12px_rgba(47,44,38,0.18)] -rotate-12 transition-transform duration-300 hover:-rotate-6 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest cursor-pointer"
          aria-label="Show previous photo"
        >
          <span key={previous} className="photo-side-in relative block aspect-square w-full overflow-hidden border border-ink/10">
            <Image src={photos[previous].src} alt="" fill sizes="88px" className="object-cover" style={{ objectPosition: photos[previous].position }} />
          </span>
        </button>
        <div key={active} className="photo-turn absolute left-8 top-4 z-10 w-56 rounded-sm border border-pencil bg-paper p-2 pb-7 shadow-[4px_12px_28px_rgba(47,44,38,0.2)] -rotate-2 md:w-64">
          <div className="relative aspect-square w-full overflow-hidden border border-ink/10">
            <Image
              src={photos[active].src}
              alt={photos[active].alt}
              fill
              priority
              sizes="(max-width: 768px) 208px, 240px"
              className="object-cover"
              style={{ objectPosition: photos[active].position }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActive(next)}
          className="absolute right-0 top-28 z-20 w-24 rounded-sm border border-pencil bg-paper p-1 pb-3 shadow-[2px_5px_12px_rgba(47,44,38,0.18)] rotate-12 transition-transform duration-300 hover:rotate-6 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest cursor-pointer"
          aria-label="Show next photo"
        >
          <span key={next} className="photo-side-in relative block aspect-square w-full overflow-hidden border border-ink/10">
            <Image src={photos[next].src} alt="" fill sizes="88px" className="object-cover" style={{ objectPosition: photos[next].position }} />
          </span>
        </button>
      </div>
      <div className="hand mt-1 flex items-center gap-3 text-sm text-ink-soft">
        <button type="button" onClick={() => setActive(previous)} className="quiet-link cursor-pointer p-1" aria-label="Previous photo">←</button>
        <span aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
        <button type="button" onClick={() => setActive(next)} className="quiet-link cursor-pointer p-1" aria-label="Next photo">→</button>
      </div>
    </div>
  );
}
