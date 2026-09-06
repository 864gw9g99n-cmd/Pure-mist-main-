import PerfumeSprayHero from './PerfumeSprayHero';

export default function Hero() {
  return (
    <section className="relative min-h-screen-safe w-full flex items-center justify-center overflow-hidden pt-16">
      <PerfumeSprayHero />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center animate-fadeIn">
        <p className="uppercase tracking-[0.3em] text-gold text-xs sm:text-sm mb-6">
          The Art of Scent
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl leading-tight text-gold-gradient mb-6 drop-shadow-lg">
          Pure Mist
        </h1>
        <p className="text-neutral-200 max-w-xl mx-auto text-sm sm:text-base leading-relaxed drop-shadow">
          An exclusive collection of luxury perfumes, composed with rare absolutes and
          precious oils. Discover fragrance as an art form.
        </p>
      </div>
    </section>
  );
}
