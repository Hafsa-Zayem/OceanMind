// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type User = {
  id: string;
  email: string;
  //name?: string;
  //phone?: string;
};

type RegisterPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

type AuthContextType = {
  ready: boolean;
  logged: boolean;
  user: User | null;

  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const logged = !!user;

  // ✅ load session on app start + listen to auth changes
  useEffect(() => {
    // 1) initial session
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) console.warn("getSession error:", error.message);

        const u = data.session?.user;
        if (u) {
          setUser({
            id: u.id,
            email: u.email ?? "",
          });
        } else {
          setUser(null);
        }
      })
      .finally(() => setReady(true));

    // 2) subscribe to login/logout/refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        setUser({
          id: u.id,
          email: u.email ?? "",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // user state will update automatically via onAuthStateChange
  };

  const register = async (payload: RegisterPayload) => {
    const { name, phone, email, password } = payload;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    // OPTIONAL (recommended): save name/phone into profiles table
    // If you didn't create profiles table yet, you can remove this block.
    const { data: sessionData } = await supabase.auth.getSession();
    const u = sessionData.session?.user;

    if (u) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert({ id: u.id, full_name: name, phone });

      if (profileErr) throw new Error(profileErr.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    // user state will become null via onAuthStateChange
  };

  const value = useMemo(
    () => ({ ready, logged, user, login, register, logout }),
    [ready, logged, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
