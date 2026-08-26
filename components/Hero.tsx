export default function Hero() {
  return (
    <section className="relative min-h-screen-safe w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-dark via-midnight to-black pt-16">
      {/* ambient glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gold-rose/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center animate-fadeIn">
        <p className="uppercase tracking-[0.3em] text-gold text-xs sm:text-sm mb-6">
          The Art of Scent
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl leading-tight text-gold-gradient mb-6">
          Pure Mist
        </h1>
        <p className="text-neutral-300 max-w-xl mx-auto mb-10 text-sm sm:text-base leading-relaxed">
          Join our exclusive Pure Mist Perfume Webinar — an intimate masterclass on
          fragrance layering, rare ingredients, and the craft behind our collection.
        </p>
      </div>
    </section>
  );
}
