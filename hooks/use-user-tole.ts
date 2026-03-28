import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type UserRole = "admin" | "teacher" | "student";

interface UserData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  organization_id: string | null;
  email: string;
}

export function useUserRole() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      setUserData({
        ...profile,
        organization_id: member?.organization_id ?? null,
        email: user.email ?? "",
      });

      setLoading(false);
    }

    fetchUser();
  }, []);

  return { userData, loading };
}
