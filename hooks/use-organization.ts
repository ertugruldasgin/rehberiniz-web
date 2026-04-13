import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: member, error: memberError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) {
        console.error("member error:", memberError);
        setLoading(false);
        return;
      }

      if (!member?.organization_id) {
        setLoading(false);
        return;
      }

      const { data, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug, is_active, phone, email, website, address")
        .eq("id", member.organization_id)
        .maybeSingle();

      if (orgError) {
        console.error("org error:", orgError);
        setLoading(false);
        return;
      }

      if (data) setOrganization(data);
    } catch (err) {
      console.error("fetchOrganization error:", err);
      setError("Organizasyon bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return { organization, loading, error, refetch: fetchOrganization };
}
