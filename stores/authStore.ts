import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '../types/database';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  trainingConsent: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setTrainingConsent: (consent: boolean) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  trainingConsent: false,

  setSession: (session) => set({ session, user: session?.user || null }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setTrainingConsent: (trainingConsent) => set({ trainingConsent }),

  fetchProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        set({ profile: data as Profile });
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },
}));
