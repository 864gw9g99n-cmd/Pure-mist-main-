'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type Droplet = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

function makeDroplets(): Droplet[] {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i + Math.random(),
    left: Math.random() < 0.5 ? Math.random() * 25 : 70 + Math.random() * 25,
    delay: Math.random() * 0.5,
    duration: 1.3 + Math.random() * 0.9,
    size: 4 + Math.random() * 8,
  }));
}

// A persistent, replayable hero visual — not a one-time splash. Idle state
// shows the bottle only; spraying reveals mist + droplets, then resets back
// to idle so it can always be viewed/replayed. Desktop users trigger it by
// clicking; touch devices (no hover capability) auto-trigger it once on
// first load, since there's no hover/click affordance to discover there.
export default function PerfumeSprayHero() {
  const [phase, setPhase] = useState<'idle' | 'spraying'>('idle');
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const autoFired = useRef(false);

  function spray() {
    if (phase === 'spraying') return;
    setDroplets(makeDroplets());
    setPhase('spraying');
    setTimeout(() => setPhase('idle'), 2400);
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
    <div
      onClick={spray}
      className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden glass cursor-pointer select-none"
      role="button"
      aria-label="Spray Pure Mist"
    >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: phase === 'spraying' ? 1.03 : 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Image
          src="/perfume-spray.webp"
          alt="Pure Mist perfume bottle"
          fill
          priority
          sizes="(max-width: 640px) 90vw, 400px"
          className="object-cover"
        />
      </motion.div>

      <AnimatePresence>
        {phase === 'spraying' && (
          <>
            {/* mist burst */}
            <motion.div
              className="absolute z-10"
              style={{ top: '20%', left: '55%' }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 0.7, 0.3], scale: [0.3, 1.5, 1.9] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <div
                className="w-32 h-32 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(232,199,102,0.5) 0%, rgba(232,199,102,0.15) 45%, transparent 70%)',
                }}
              />
            </motion.div>

            {/* falling droplets */}
            {droplets.map((d) => (
              <motion.div
                key={d.id}
                className="absolute rounded-full z-10"
                style={{
                  top: '5%',
                  left: `${d.left}%`,
                  width: d.size,
                  height: d.size,
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
          </>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* desktop-only hint, hidden once sprayed at least once this render */}
      <div className="hidden sm:flex absolute bottom-3 left-0 right-0 justify-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-neutral-300/80 bg-black/40 px-3 py-1 rounded-full">
          Click to Spray
        </span>
      </div>
    </div>
  );
}
