import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "bexmatch_cookie_consent";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    // Set actual cookies
    document.cookie = `bm_essential=true; path=/; max-age=31536000; SameSite=Lax`;
    if (prefs.analytics) {
      document.cookie = `bm_analytics=true; path=/; max-age=31536000; SameSite=Lax`;
    }
    if (prefs.preferences) {
      document.cookie = `bm_preferences=true; path=/; max-age=31536000; SameSite=Lax`;
    }
    setVisible(false);
  };

  const acceptAll = () => {
    const all = { essential: true, analytics: true, preferences: true };
    setPreferences(all);
    saveConsent(all);
  };

  const declineOptional = () => {
    const essential = { essential: true, analytics: false, preferences: false };
    setPreferences(essential);
    saveConsent(essential);
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-5 md:p-6">
            {!showSettings ? (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">We use cookies 🍪</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      BexMatch uses cookies to enhance your experience, analyze site traffic, and store your preferences. 
                      By clicking "Accept All", you consent to our use of cookies.{" "}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={acceptAll} size="sm" className="rounded-full">
                    Accept All
                  </Button>
                  <Button onClick={declineOptional} variant="outline" size="sm" className="rounded-full">
                    Essential Only
                  </Button>
                  <Button onClick={() => setShowSettings(true)} variant="ghost" size="sm" className="rounded-full">
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Customize
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Cookie Settings
                  </h3>
                  <button onClick={() => setShowSettings(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">Essential</p>
                      <p className="text-xs text-muted-foreground">Required for authentication & security</p>
                    </div>
                    <Switch checked disabled />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">Analytics</p>
                      <p className="text-xs text-muted-foreground">Help us understand how you use BexMatch</p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(v) => setPreferences(p => ({ ...p, analytics: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">Preferences</p>
                      <p className="text-xs text-muted-foreground">Remember your theme & language settings</p>
                    </div>
                    <Switch
                      checked={preferences.preferences}
                      onCheckedChange={(v) => setPreferences(p => ({ ...p, preferences: v }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveCustom} size="sm" className="rounded-full">
                    Save Preferences
                  </Button>
                  <Button onClick={acceptAll} variant="outline" size="sm" className="rounded-full">
                    Accept All
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
