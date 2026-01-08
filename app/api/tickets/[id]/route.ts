import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch single ticket
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: ticket, error } = await supabase.from("tickets").select("*").eq("id", id).single()

  if (error || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }

  // Check permissions
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Customer can only view their own tickets
  if (profile.role === "customer" && ticket.customer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let assigned_agent = null
  if (ticket.assigned_agent_id) {
    const { data: agent } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", ticket.assigned_agent_id)
      .single()
    assigned_agent = agent
  }

  return NextResponse.json({
    ...ticket,
    assigned_agent,
  })
}
// PATCH - Update ticket (agents only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is agent
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  if (profile.role !== "support_agent") {
    return NextResponse.json({ error: "Only support agents can update tickets" }, { status: 403 })
  }

  const body = await request.json()
  const { status, assigned_agent_id } = body

  if (!status && !assigned_agent_id) {
    return NextResponse.json({ error: "Status or assigned_agent_id required" }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (status) {
    if (!["open", "in_progress", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    updateData.status = status
  }

  if (assigned_agent_id !== undefined) {
    updateData.assigned_agent_id = assigned_agent_id
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 🔥 IMPORTANT PART — return full agent object
  let assigned_agent = null

  if (ticket.assigned_agent_id) {
    const { data: agent } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", ticket.assigned_agent_id)
      .single()

    assigned_agent = agent
  }

  return NextResponse.json({
    ...ticket,
    assigned_agent,
  })
}
