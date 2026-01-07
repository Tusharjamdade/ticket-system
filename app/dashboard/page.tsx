import { getUser, getUserRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await getUser()
  const role = await getUserRole()

  if (!user) {
    redirect("/auth/login")
  }

  // Route to appropriate dashboard based on role
  if (role === "support_agent") {
    redirect("/dashboard/agent")
  } else {
    redirect("/dashboard/customer")
  }
}
