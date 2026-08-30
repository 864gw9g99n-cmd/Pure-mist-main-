'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'pure-mist-intro-seen';

type Droplet = {
  id: number;
  left: number; // percentage across screen
  delay: number;
  duration: number;
  size: number;
};

export default function IntroSpray() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'bottle' | 'spray' | 'drops' | 'done'>('bottle');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage unavailable — just show it once for this render, no harm.
    }
    setShow(true);

    const t1 = setTimeout(() => setPhase('spray'), 500);
    const t2 = setTimeout(() => setPhase('drops'), 1200);
    const t3 = setTimeout(() => {
      setPhase('done');
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // ignore
      }
    }, 2800);
    const t4 = setTimeout(() => setShow(false), 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const droplets: Droplet[] = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: 30 + Math.random() * 40, // cluster around the spray cone, center-ish
        delay: Math.random() * 0.6,
        duration: 1.4 + Math.random() * 0.8,
        size: 3 + Math.random() * 5,
      })),
    []
  );

  function skip() {
    setShow(false);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] bg-midnight flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={skip}
        >
          {/* ambient depth glow layers for a pseudo-3D feel */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 0.6 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full bg-gold-rose/10 blur-2xl"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.5 }}
            transition={{ duration: 2.2, delay: 0.3, ease: 'easeOut' }}
          />

          {/* perfume bottle silhouette */}
          <motion.svg
            width="90"
            height="140"
            viewBox="0 0 90 140"
            className="relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e8c766" />
                <stop offset="50%" stopColor="#c9a227" />
                <stop offset="100%" stopColor="#b76e79" />
              </linearGradient>
            </defs>
            {/* cap */}
            <rect x="30" y="0" width="30" height="22" rx="4" fill="url(#goldGrad)" />
            {/* neck */}
            <rect x="38" y="20" width="14" height="14" fill="url(#goldGrad)" opacity="0.9" />
            {/* body */}
            <path
              d="M20 34 Q20 34 20 44 L18 120 Q18 138 45 138 Q72 138 70 120 L68 44 Q68 34 68 34 Z"
              fill="url(#goldGrad)"
              opacity="0.85"
            />
          </motion.svg>

          {/* spray mist cone */}
          {(phase === 'spray' || phase === 'drops') && (
            <motion.div
              className="absolute z-20"
              style={{ top: '28%', left: '58%' }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 0.8, 0.4], scale: [0.3, 1.6, 2] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <div
                className="w-40 h-40 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(232,199,102,0.5) 0%, rgba(232,199,102,0.15) 45%, transparent 70%)',
                }}
              />
            </motion.div>
          )}

          {/* falling droplets */}
          {(phase === 'drops' || phase === 'done') &&
            droplets.map((d) => (
              <motion.div
                key={d.id}
                className="absolute rounded-full bg-gold-light z-10"
                style={{
                  top: '30%',
                  left: `${d.left}%`,
                  width: d.size,
                  height: d.size,
                  boxShadow: '0 0 6px rgba(232,199,102,0.6)',
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, 300 + Math.random() * 150], opacity: [0, 1, 0] }}
                transition={{ duration: d.duration, delay: d.delay, ease: 'easeIn' }}
              />
            ))}

          {/* wordmark reveal */}
          <motion.div
            className="absolute bottom-[18%] text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <p className="font-serif text-2xl sm:text-3xl tracking-[0.2em] text-gold-gradient">
              PURE MIST
            </p>
            <p className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mt-2">
              The Art of Scent
            </p>
          </motion.div>

          <button
            onClick={skip}
            className="absolute bottom-6 right-6 text-neutral-500 text-xs hover:text-gold"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
