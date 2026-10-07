"use client";

import { useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Click-to-play video. Nothing heavy downloads until the visitor asks for it
 * (preload="metadata" + a first-frame hint).
 */
export function VideoPlayer({
  src,
  label,
  playLabel,
  pauseLabel,
  className,
  rounded = true,
}: {
  src: string;
  label: string;
  playLabel: string;
  pauseLabel: string;
  className?: string;
  rounded?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  };

  return (
    <div className={cn("group relative overflow-hidden bg-navy-950", rounded && "rounded-[var(--radius-lg)]", className)}>
      <video
        ref={ref}
        src={`${src}#t=0.1`}
        preload="metadata"
        playsInline
        controls={playing}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="h-full w-full object-cover"
      />
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`${playLabel}: ${label}`}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-navy-950/60 to-transparent"
        >
          <span className="shape-bubble inline-flex size-16 items-center justify-center bg-orange-500 text-navy-950 transition-transform duration-300 group-hover:scale-110">
            <PlayIcon size={26} />
          </span>
        </button>
      )}
      {playing && (
        <button type="button" onClick={toggle} className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:rounded focus:bg-white focus:px-3 focus:py-1 focus:text-navy-900">
          <PauseIcon size={16} /> {pauseLabel}
        </button>
      )}
    </div>
  );
}
