'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

type Droplet = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

function makeDroplets(): Droplet[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + Math.random(),
    left: Math.random() < 0.5 ? Math.random() * 25 : 70 + Math.random() * 25,
    delay: Math.random() * 0.5,
    duration: 1.3 + Math.random() * 0.9,
    size: 4 + Math.random() * 8,
  }));
}

// A persistent, replayable hero visual — not a video, not a one-time splash.
// Real CSS 3D: the card sits in a perspective space and tilts on rotateX/
// rotateY in response to the pointer (spring-smoothed), so it genuinely
// responds in 3D rather than just playing a flat animation. Note: this is
// CSS/transform-based pseudo-3D built from two real photos — not a WebGL
// 3D model render, since there's no 3D asset or engine involved.
//
// Idle state shows the clean bottle photo; a click (desktop) or automatic
// first-load trigger (touch devices) crossfades to the spray photo plus a
// few extra floating droplets for added motion, then crossfades back.
export default function PerfumeSprayHero() {
  const [phase, setPhase] = useState<'idle' | 'spraying'>('idle');
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const autoFired = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pointer-tracked 3D tilt
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
    if (phase === 'spraying') return;
    setDroplets(makeDroplets());
    setPhase('spraying');
    setTimeout(() => setPhase('idle'), 2600);
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
        animate={{ y: phase === 'idle' ? [0, -8, 0] : 0 }}
        transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="relative w-full aspect-square rounded-2xl overflow-hidden glass cursor-pointer select-none shadow-2xl"
        role="button"
        aria-label="Spray Pure Mist"
      >
        <AnimatePresence mode="wait">
          {phase === 'idle' ? (
            <motion.div
              key="clean"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/perfume-bottle-clean.webp"
                alt="Pure Mist perfume bottle"
                fill
                priority
                sizes="(max-width: 640px) 90vw, 400px"
                className="object-cover"
                style={{ transform: 'translateZ(20px)' }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sprayed"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/perfume-spray.webp"
                alt="Pure Mist perfume spraying"
                fill
                sizes="(max-width: 640px) 90vw, 400px"
                className="object-cover"
                style={{ transform: 'translateZ(20px)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* extra floating droplets for motion, layered above the photo */}
        <AnimatePresence>
          {phase === 'spraying' &&
            droplets.map((d) => (
              <motion.div
                key={d.id}
                className="absolute rounded-full z-10"
                style={{
                  top: '5%',
                  left: `${d.left}%`,
                  width: d.size,
                  height: d.size,
                  transform: 'translateZ(40px)',
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(232,199,102,0.5) 60%, transparent 80%)',
                  boxShadow: '0 0 6px rgba(232,199,102,0.5)',
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: 260 + Math.random() * 120, opacity: [0, 1, 0.8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: d.duration, delay: d.delay, ease: 'easeIn' }}
              />
            ))}
        </AnimatePresence>

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
