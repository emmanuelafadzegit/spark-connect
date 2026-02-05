import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ProfileWithPhotos, getMyProfile } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileWithPhotos | null;
  loading: boolean;
  hasProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileWithPhotos | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loading = initializing || profileLoading;

  const refreshProfile = async () => {
    setProfileLoading(true);
    try {
      const { data, error } = await getMyProfile();
      if (error) {
        console.error('[auth] Failed to refresh profile', error);
        setProfile(null);
        return;
      }
      setProfile(data);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // FIRST check for existing session
    (async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error('[auth] Failed to initialize session', e);
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) setInitializing(false);
      }
    })();

    // THEN set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    profile,
    loading,
    hasProfile: !!profile?.is_profile_complete,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
