"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  currentUser: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchOrCreateProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  // maybeSingle: 0件でも406にならずnullを返す
  const { data } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", userId)
    .maybeSingle();

  if (data) return data;

  // プロフィール未作成の場合、Authユーザー情報から自動作成
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const name = user.user_metadata?.name ?? "";
  const email = user.email ?? "";

  const { data: created } = await supabase
    .from("profiles")
    .upsert({ id: userId, name, email })
    .select("id, name, email")
    .single();

  return created;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchOrCreateProfile(user.id).then((profile) => {
          setCurrentUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchOrCreateProfile(session.user.id).then(setCurrentUser);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<string | null> => {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return error.message;
      return null;
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
