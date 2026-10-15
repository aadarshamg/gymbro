import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { api, ApiError, devLogin as devLoginRequest } from "../lib/api";
import { getDevToken, setDevToken, clearDevToken } from "../lib/devAuth";
import type { Gym } from "../lib/types";

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  gym: Gym | null;
  loading: boolean;
  needsOnboarding: boolean;
  refreshGym: () => Promise<void>;
  devLogin: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [devToken, setDevTokenState] = useState<string | null>(() => getDevToken());
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  async function refreshGym() {
    try {
      const { gym } = await api.get<{ gym: Gym }>("/gyms/me");
      setGym(gym);
      setNeedsOnboarding(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setGym(null);
        setNeedsOnboarding(true);
      } else {
        throw err;
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session || getDevToken()) await refreshGym();
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await refreshGym();
      } else if (!getDevToken()) {
        setGym(null);
        setNeedsOnboarding(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function devLogin(email: string) {
    const { access_token } = await devLoginRequest(email);
    setDevToken(access_token);
    setDevTokenState(access_token);
    await refreshGym();
  }

  async function signOut() {
    await supabase.auth.signOut();
    clearDevToken();
    setDevTokenState(null);
    setGym(null);
    setNeedsOnboarding(false);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session || !!devToken,
        gym,
        loading,
        needsOnboarding,
        refreshGym,
        devLogin,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
