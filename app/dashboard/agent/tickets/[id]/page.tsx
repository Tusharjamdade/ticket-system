"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"

interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  assigned_agent_id?: string
  assigned_agent?: {
    id: string
    full_name: string
  }
  customer_id: string
}

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAssigningLocally, setIsAssigningLocally] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusValue, setStatusValue] = useState("")
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string
  const supabase = createClient()
  

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  useEffect(() => {
    if (ticket) {
      setStatusValue(ticket.status)
    }
  }, [ticket])

  const fetchTicket = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ticket")
      }
      const data = await response.json()
      setTicket(data)
      setStatusValue(data.status)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update ticket")
      }

      const updatedTicket = await response.json()
      setTicket(updatedTicket)
      setStatusValue(updatedTicket.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
      setStatusValue(ticket.status)
    } finally {
      setIsSaving(false)
    }
  }

const handleAssignToMe = async () => {
  if (!ticket) return

  setIsAssigningLocally(true)
  setIsSaving(true)

  try {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assigned_agent_id: currentUserId,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to assign ticket")
    }

    const updatedTicket = await response.json()

    // 🔥 Update ticket + assignment state
    setTicket(updatedTicket)

    // 🎯 Stop showing processing state immediately
    setIsAssigningLocally(false)

  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to assign ticket")

    // allow retry
    setIsAssigningLocally(false)
  } finally {
    setIsSaving(false)
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isAssignedToMe = ticket?.assigned_agent_id === currentUserId

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/agent"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Ticket Details</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading ticket details...</p>
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
        ) : ticket ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{ticket.title}</CardTitle>
                    <CardDescription>ID: {ticket.id}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                  <p className="text-base whitespace-pre-wrap">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Created</p>
                    <p className="text-sm">{formatDate(ticket.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Last Updated</p>
                    <p className="text-sm">{formatDate(ticket.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Update */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Update Status</label>
                  <div className="flex gap-2">
                    <Select value={statusValue} onValueChange={handleStatusChange} disabled={isSaving}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    {isSaving && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                  </div>
                </div>

                {/* Assigned Agent Info and Assign Button */}
                <div>
                  {ticket.assigned_agent ? (
                    <div className="space-y-3">
                      <div className="bg-primary/10 p-4 rounded border border-primary/20">
                        <p className="text-sm font-semibold text-primary mb-1">Assigned Agent</p>
                        <p className="text-sm text-foreground">{ticket.assigned_agent.full_name}</p>
                      </div>
                      {!isAssignedToMe && !isAssigningLocally && (
                        <Button
                          onClick={handleAssignToMe}
                          disabled={isSaving}
                          className="w-full bg-transparent"
                          variant="outline"
                        >
                          {isSaving ? "Assigning..." : "Assign to Me (Override)"}
                        </Button>
                      )}
                      {isAssigningLocally && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-400">Processing...</p>
                          <Button disabled className="w-full mt-3" variant="secondary">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Assigning to you...
                          </Button>
                        </div>
                      )}
                      {isAssignedToMe && !isAssigningLocally && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
                          <p className="text-sm font-semibold text-green-900 dark:text-green-400">Assigned to you</p>
                          <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                            This ticket is currently assigned to your account. Other agents can still override this
                            assignment.
                          </p>
                          <Button disabled className="w-full mt-3" variant="secondary">
                            Already assigned to you
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">This ticket is not assigned yet.</p>
                      <Button onClick={handleAssignToMe} disabled={isSaving || isAssigningLocally} className="w-full">
                        {isAssigningLocally || isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          "Assign to Me"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Ticket not found</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
