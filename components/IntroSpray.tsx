'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'pure-mist-intro-seen';

type Droplet = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

export default function IntroSpray() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'image' | 'drops' | 'done'>('image');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage unavailable — just show it once for this render, no harm.
    }
    setShow(true);

    const t1 = setTimeout(() => setPhase('drops'), 600);
    const t2 = setTimeout(() => {
      setPhase('done');
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // ignore
      }
    }, 3200);
    const t3 = setTimeout(() => setShow(false), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Extra droplets layered on top of the photo for added motion — sticking
  // near the edges so they don't compete with the bottle/engraving in the
  // center of the image.
  const droplets: Droplet[] = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.random() < 0.5 ? Math.random() * 25 : 70 + Math.random() * 25,
        delay: Math.random() * 0.8,
        duration: 1.6 + Math.random() * 1,
        size: 4 + Math.random() * 8,
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
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={skip}
        >
          {/* the real branded macro shot, slow cinematic zoom-in */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            <Image
              src="/perfume-spray.webp"
              alt="Pure Mist perfume spray"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
          </motion.div>

          {/* extra droplets sliding down over the photo for added depth/motion */}
          {(phase === 'drops' || phase === 'done') &&
            droplets.map((d) => (
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
                  boxShadow: '0 0 8px rgba(232,199,102,0.5)',
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, 700 + Math.random() * 300], opacity: [0, 1, 0.8, 0] }}
                transition={{ duration: d.duration, delay: d.delay, ease: 'easeIn' }}
              />
            ))}

          {/* wordmark reveal */}
          <motion.div
            className="absolute bottom-[14%] text-center z-20"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.6 }}
          >
            <p className="font-serif text-2xl sm:text-3xl tracking-[0.2em] text-gold-gradient drop-shadow-lg">
              PURE MIST
            </p>
            <p className="text-neutral-300 text-[10px] uppercase tracking-[0.3em] mt-2">
              The Art of Scent
            </p>
          </motion.div>

          <button
            onClick={skip}
            className="absolute bottom-6 right-6 text-neutral-300 text-xs hover:text-gold z-20"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
