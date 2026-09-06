'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// A persistent, always-on ambient 3D background for the Hero section —
// not a video, not a clickable card. The photo sits inside a CSS
// perspective space and tilts on rotateX/rotateY in response to the
// pointer (spring-smoothed), so it responds in real 3D space rather than
// sitting flat. This is CSS/transform-based pseudo-3D built from a real
// photo — not a WebGL 3D model render, since there's no 3D asset or
// engine involved.
export default function PerfumeSprayHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const scaleTransform = useTransform(springX, () => 1.06);

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

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      style={{ perspective: 1200 }}
      className="absolute inset-0 -z-10"
    >
      <motion.div
        style={{ rotateX, rotateY, scale: scaleTransform, transformStyle: 'preserve-3d' }}
        animate={{ y: [0, -10, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute inset-0"
      >
        <Image
          src="/perfume-spray.webp"
          alt="Pure Mist"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* dark gradient so overlaid text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-midnight" />
    </div>
  );
}
