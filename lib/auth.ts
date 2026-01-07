import { createClient } from "@/lib/supabase/server"

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  return profile?.role || "customer"
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
