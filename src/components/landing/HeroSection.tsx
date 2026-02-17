import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Find your perfect match on BexMatch"
          className="w-full h-full object-cover scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Ambient blobs */}
      <motion.div
        className="absolute top-24 left-8 w-40 h-40 rounded-full bg-primary/25 blur-3xl"
        animate={{ y: [0, -25, 0], x: [0, 12, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 right-12 w-52 h-52 rounded-full bg-match/20 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-white/90 font-medium tracking-wide">Find your perfect match</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight"
          >
            Where
            <span className="block text-gradient-hero">Love Begins</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            Discover meaningful connections with people who share your interests. 
            Swipe, match, and start conversations that could last a lifetime.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Button asChild variant="hero" size="xl" className="rounded-full w-full sm:w-auto">
              <Link to="/signup" className="gap-2.5">
                <Heart className="w-5 h-5" />
                Start Matching
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl" className="rounded-full w-full sm:w-auto">
              <Link to="/signin">
                I have an account
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-16 sm:mt-20 flex flex-wrap justify-center gap-8 sm:gap-12 md:gap-16"
          >
            {[
              { value: "5M+", label: "Active Users" },
              { value: "100K+", label: "Matches Daily" },
              { value: "50K+", label: "Success Stories" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/50 mt-1 tracking-wide uppercase font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/40 tracking-widest uppercase">Scroll</span>
          <ArrowDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
