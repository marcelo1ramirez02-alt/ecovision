import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const {
    user,
    session,
    profile,
    isLoading,
    trainingConsent,
    setSession,
    setProfile,
    setTrainingConsent,
    fetchProfile,
    signOut,
  } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!session?.user,
    trainingConsent,
    setTrainingConsent,
    signOut,
    refreshProfile: fetchProfile,
  };
};
