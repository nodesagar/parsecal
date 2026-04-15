"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  const supabase = createClient()

  const themeOptions = [
    { value: "light", label: "Light Mode", icon: Sun },
    { value: "dark", label: "Deep Obsidian Mode", icon: Moon },
    { value: "system", label: "System Preference", icon: Monitor },
  ]

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = (newTheme: string) => {
    // 1. Update UI immediately
    setTheme(newTheme)

    // Explicitly toggle class as backup in case next-themes is blocked
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System mode logic
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    }

    // 2. Persist to DB in background
    const syncTheme = async () => {
      setUpdating(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ theme_preference: newTheme })
            .eq('id', user.id)
        }
      } catch (error) {
        console.error("Failed to sync theme preference:", error)
      } finally {
        setUpdating(false)
      }
    }

    syncTheme()
  }

  if (!mounted) {
    return (
      <div className="inline-flex h-11 w-37 rounded-2xl border border-border bg-bg opacity-0" />
    )
  }

  return (
    <div
      role="tablist"
      aria-label="Theme"
      className="relative inline-flex w-fit items-center gap-0.5 rounded-2xl border border-border bg-bg-card/80 p-1 shadow-sm backdrop-blur-sm"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            onClick={() => toggleTheme(option.value)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={isActive}
            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${isActive
                ? "border-border bg-bg shadow-sm text-primary"
                : "border-transparent text-text-muted hover:text-text hover:bg-bg/60"
              }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}

      {updating && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
          <Loader2 className="w-3 h-3 text-text-muted animate-spin" />
        </div>
      )}
    </div>
  )
}
