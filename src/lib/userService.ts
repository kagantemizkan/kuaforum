import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("user_id", userId).single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await getUserProfile(userId);
  if (error || !data) {
    console.error("Error fetching user role:", error);
    return null;
  }
  return data.role || null;
}
