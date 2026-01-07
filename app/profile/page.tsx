"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LogOut, Mail, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "customer" | "support_agent"
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, created_at")
          .eq("id", user.id)
          .single()

        if (profileError || !profileData) {
          setError("Profile information not found. Please contact support.")
          return
        }

        setProfile({
          id: profileData.id,
          email: user.email || "",
          full_name: profileData.full_name,
          role: profileData.role as "customer" | "support_agent",
          created_at: profileData.created_at,
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getRoleColor = (role: string) => {
    return role === "support_agent"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  }

  const getRoleLabel = (role: string) => {
    return role === "support_agent" ? "Support Agent" : "Customer"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={profile?.role === "support_agent" ? "/dashboard/agent" : "/dashboard/customer"}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading profile...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="bg-destructive/10 text-destructive text-sm p-4 rounded border border-destructive/20">
                {error}
              </div>
            </CardContent>
          </Card>
        ) : profile ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Profile Details</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">Full Name</label>
                  <div className="bg-muted p-4 rounded border border-muted-foreground/20">
                    <p className="text-lg font-medium">{profile.full_name}</p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">Email Address</label>
                  <div className="flex items-center gap-3 bg-muted p-4 rounded border border-muted-foreground/20">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <p className="text-base font-medium">{profile.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">Account Role</label>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div className={`px-4 py-2 rounded font-medium text-sm ${getRoleColor(profile.role)}`}>
                      {getRoleLabel(profile.role)}
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">Member Since</label>
                  <p className="text-base text-muted-foreground">{formatDate(profile.created_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Profile not found</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
