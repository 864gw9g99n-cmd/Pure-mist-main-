'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

// A persistent, replayable hero visual — a real video clip (not a photo
// crossfade), sitting inside a CSS 3D perspective space that tilts on
// rotateX/rotateY in response to the pointer (spring-smoothed), so it
// genuinely responds in 3D rather than just playing flat. This is CSS/
// transform-based pseudo-3D — not a WebGL 3D model render, since there's
// no 3D asset or engine involved.
//
// Idle: video is paused at frame 0 (poster), showing the clean bottle.
// A click (desktop) or automatic first-load trigger (touch devices) plays
// the clip through the spray moment, then it resets back to frame 0.
export default function PerfumeSprayHero() {
  const [playing, setPlaying] = useState(false);
  const autoFired = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 15 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);

  function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function spray() {
    const video = videoRef.current;
    if (!video || playing) return;
    setPlaying(true);
    video.currentTime = 0;
    video.play().catch(() => {
      // Autoplay can be blocked in some contexts — fail silently, the
      // click handler remains available as a fallback trigger.
      setPlaying(false);
    });
  }

  function handleEnded() {
    setPlaying(false);
    const video = videoRef.current;
    if (video) video.currentTime = 0;
  }

  useEffect(() => {
    if (autoFired.current) return;
    const isTouchOnly = window.matchMedia('(hover: none)').matches;
    if (isTouchOnly) {
      autoFired.current = true;
      const t = setTimeout(spray, 500);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div style={{ perspective: 1200 }} className="w-full max-w-sm mx-auto">
      <motion.div
        ref={wrapperRef}
        onClick={spray}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={{ y: !playing ? [0, -8, 0] : 0 }}
        transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="relative w-full aspect-square rounded-2xl overflow-hidden glass cursor-pointer select-none shadow-2xl"
        role="button"
        aria-label="Spray Pure Mist"
      >
        <video
          ref={videoRef}
          src="/perfume-spray-video.mp4"
          poster="/perfume-spray-poster.jpg"
          muted
          playsInline
          preload="auto"
          onEnded={handleEnded}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'translateZ(20px)' }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        <div className="hidden sm:flex absolute bottom-3 left-0 right-0 justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest text-neutral-300/80 bg-black/40 px-3 py-1 rounded-full">
            Click to Spray
          </span>
        </div>
      </motion.div>
    </div>
  );
}
