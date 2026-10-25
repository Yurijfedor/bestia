import { useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthContext, type UserRole } from "./AuthContextValue";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error("Не вдалося завантажити сесію:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);

        if (newSession?.user) {
          setIsProfileLoading(true);
        } else {
          setRole(null);
          setIsProfileLoading(false);
        }

        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileRole() {
      if (!user) {
        setRole(null);
        setIsProfileLoading(false);
        return;
      }

      setRole(null);
      setIsProfileLoading(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (isMounted) {
          const profileRole = data?.role;
          setRole(
            profileRole === "admin" || profileRole === "client"
              ? profileRole
              : null,
          );
        }
      } catch (error) {
        console.error("Не вдалося завантажити роль профілю:", error);
        if (isMounted) {
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    }

    void loadProfileRole();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, session, role, isLoading, isProfileLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
