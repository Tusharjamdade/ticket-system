import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch tickets based on user role
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  let ticketsQuery = supabase.from("tickets").select("*").order("created_at", { ascending: false })

  if (profile.role === "customer") {
    ticketsQuery = ticketsQuery.eq("customer_id", user.id)
  }
  // Agents see all tickets

  const { data: tickets, error } = await ticketsQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (tickets && tickets.length > 0) {
    const agentIds = tickets.map((ticket: any) => ticket.assigned_agent_id).filter((id: any) => id !== null)

    if (agentIds.length > 0) {
      const { data: agents } = await supabase.from("profiles").select("id, full_name").in("id", agentIds)

      const agentMap = new Map(agents?.map((agent: any) => [agent.id, agent]) || [])

      return NextResponse.json(
        tickets.map((ticket: any) => ({
          ...ticket,
          assigned_agent: ticket.assigned_agent_id ? agentMap.get(ticket.assigned_agent_id) : null,
        })),
      )
    }
  }

  return NextResponse.json(tickets)
}

// POST - Create a new ticket
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Only customers can create tickets
  if (profile.role !== "customer") {
    return NextResponse.json({ error: "Only customers can create tickets" }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, priority } = body

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      customer_id: user.id,
      title,
      description,
      priority: priority || "medium",
      status: "open",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(ticket, { status: 201 })
}
