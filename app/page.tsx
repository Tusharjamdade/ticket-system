import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  const user = await getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold">Ticket System</h1>
            <p className="text-lg text-muted-foreground">Professional customer support ticket management platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Customers</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Create and track support tickets. Get quick responses from our support team.
                </p>
                <Link href="/auth/register?role=customer">
                  <Button className="w-full">Get Started as Customer</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Support Agents</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Manage customer tickets efficiently. Resolve issues and track progress.
                </p>
                <Link href="/auth/register?role=support_agent">
                  <Button className="w-full bg-transparent" variant="outline">
                    Register as Agent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Already have an account?</p>
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
