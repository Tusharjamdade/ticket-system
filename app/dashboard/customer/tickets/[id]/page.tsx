"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
}

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ticket")
      }
      const data = await response.json()
      setTicket(data)
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/customer"
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

              {ticket.assigned_agent ? (
                <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded border border-primary/20 dark:border-primary/30">
                  <p className="text-xs font-semibold text-primary dark:text-primary mb-1">Assigned Agent</p>
                  <p className="text-sm text-foreground">{ticket.assigned_agent.full_name}</p>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded border border-muted">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Assignment Status</p>
                  <p className="text-sm text-muted-foreground">This ticket is not yet assigned to an agent.</p>
                </div>
              )}
            </CardContent>
          </Card>
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
