/**
 * NotFound.tsx
 * 
 * Custom 404 page displayed when a user navigates to a non-existent route.
 * Features a friendly design with the app branding and a clear path back home.
 */

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import BexMatchLogo from "@/components/BexMatchLogo";

const NotFound = () => {
  const location = useLocation();

  // Log 404 errors for debugging/analytics
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with logo */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/">
            <BexMatchLogo size="sm" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          {/* Animated 404 graphic */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mb-8"
          >
            {/* Large 404 number with gradient */}
            <h1 className="text-[120px] sm:text-[160px] font-black leading-none bg-gradient-to-br from-primary via-primary/70 to-accent bg-clip-text text-transparent select-none">
              404
            </h1>
            
            {/* Decorative heart */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Heart className="w-12 h-12 text-primary/20 fill-primary/10" />
            </motion.div>
          </motion.div>

          {/* Error message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Oops! Page not found
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Looks like this page took a wrong swipe. 
              The page you're looking for doesn't exist or has been moved.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/app">
                <Search className="w-5 h-5" />
                Start Discovering
              </Link>
            </Button>
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back to previous page
            </button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-primary fill-primary" /> by BexMatch
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
