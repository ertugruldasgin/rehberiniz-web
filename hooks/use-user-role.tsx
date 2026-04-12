"use client";

import { createClient } from "@/lib/supabase/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type UserRole = "admin" | "teacher" | "student";

export interface UserData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  organization_id: string | null;
  organization_name: string | null;
  email: string;
  is_active: boolean;
  last_sign_in_at: string | null;
}

interface UserRoleContextValue {
  userData: UserData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, is_active, last_sign_in_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id, organizations(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    setUserData({
      ...profile,
      organization_id: member?.organization_id ?? null,
      organization_name: (member?.organizations as any)?.name ?? null,
      email: user.email ?? "",
      is_active: profile.is_active ?? true,
      last_sign_in_at: profile.last_sign_in_at ?? null,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserRoleContext.Provider value={{ userData, loading, refresh: fetchUser }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
