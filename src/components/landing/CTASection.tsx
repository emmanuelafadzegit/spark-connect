import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Decorative blobs */}
      <motion.div
        className="absolute top-10 left-10 w-48 h-48 rounded-full bg-white/8 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-white/6 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-white/15 backdrop-blur-sm mb-8"
          >
            <Heart className="w-9 h-9 text-white fill-white/80" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight">
            Your Next Chapter<br />Starts Here
          </h2>
          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-lg mx-auto leading-relaxed font-light">
            Join millions of singles who have found love on BexMatch.
            Your perfect match could be just one swipe away.
          </p>

          <Button
            asChild
            size="xl"
            className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:scale-[1.03] active:scale-100 rounded-full font-bold"
          >
            <Link to="/signup" className="gap-2.5">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          <p className="mt-8 text-white/45 text-xs sm:text-sm tracking-wide">
            Free to join · No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
