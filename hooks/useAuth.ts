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
    // Safety fallback timeout to prevent infinite spinner on network lag
    const safetyTimeout = setTimeout(() => {
      useAuthStore.setState({ isLoading: false });
    }, 2500);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile();
      } else {
        useAuthStore.setState({ isLoading: false });
      }
      clearTimeout(safetyTimeout);
    }).catch((err) => {
      console.error('getSession error:', err);
      useAuthStore.setState({ isLoading: false });
      clearTimeout(safetyTimeout);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
        useAuthStore.setState({ isLoading: false });
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
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
