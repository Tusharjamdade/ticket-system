"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
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
  assigned_agent?: {
    id: string
    full_name: string
  }
}

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/tickets")
      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }
      const data = await response.json()
      setTickets(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
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
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your support tickets</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Ticket Button */}
        <div className="mb-8">
          <Link href="/dashboard/customer/create-ticket">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create New Ticket
            </Button>
          </Link>
        </div>

        {/* Tickets List */}
        <div className="space-y-8">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading your tickets...</p>
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
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No tickets yet. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {tickets.map((ticket) => (
                <Link key={ticket.id} href={`/dashboard/customer/tickets/${ticket.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{ticket.title}</h3>
                            {ticket.assigned_agent && (
                              <Badge variant="outline" className="text-xs">
                                Assigned to {ticket.assigned_agent.full_name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ticket.description}</p>
                          <p className="text-xs text-muted-foreground">Created {formatDate(ticket.created_at)}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
