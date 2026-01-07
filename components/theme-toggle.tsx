"use client"

import { useContext } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeContext } from "@/lib/theme-provider"

export function ThemeToggle() {
  const { isDark, toggleTheme } = useContext(ThemeContext)

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
