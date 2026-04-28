"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full border border-border/60 bg-card/70 text-foreground hover:bg-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-border/60 bg-popover/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#111118]/95">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer text-foreground hover:bg-accent/40 hover:text-accent-foreground dark:text-white dark:hover:bg-white/6 dark:hover:text-white">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer text-foreground hover:bg-accent/40 hover:text-accent-foreground dark:text-white dark:hover:bg-white/6 dark:hover:text-white">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer text-foreground hover:bg-accent/40 hover:text-accent-foreground dark:text-white dark:hover:bg-white/6 dark:hover:text-white">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
