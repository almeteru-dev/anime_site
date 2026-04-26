"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export type UserListStatus = "watching" | "planned" | "completed" | "on_hold" | "dropped"

export type AddToUserListProps = {
  animeId: string
  onUpdate: (animeId: string, status: UserListStatus) => Promise<void>
}

export function AddToUserList({ animeId, onUpdate }: AddToUserListProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [selected, setSelected] = useState<UserListStatus | null>(null)

  const label = useMemo(() => {
    if (phase === "loading") return "Saving..."
    if (phase === "success") return "Saved"
    if (!selected) return "Add to List"
    if (selected === "watching") return "Watching"
    if (selected === "planned") return "Plan to Watch"
    if (selected === "completed") return "Completed"
    if (selected === "on_hold") return "On Hold"
    return "Dropped"
  }, [phase, selected])

  const items: { value: UserListStatus; label: string }[] = [
    { value: "watching", label: "Watching" },
    { value: "planned", label: "Plan to Watch" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "dropped", label: "Dropped" },
  ]

  const handlePick = async (value: UserListStatus) => {
    setPhase("loading")
    try {
      await onUpdate(animeId, value)
      setSelected(value)
      setPhase("success")
      window.setTimeout(() => setPhase("idle"), 1200)
    } catch {
      setPhase("error")
      window.setTimeout(() => setPhase("idle"), 1500)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={phase === "loading"}
          className="bg-[#00E5FF] text-[#040D1F] hover:bg-[#00E5FF]/90 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          {label}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#081229] border-[#1A2847]">
        {items.map((it) => (
          <DropdownMenuItem
            key={it.value}
            onClick={() => handlePick(it.value)}
            className="text-[#D1D9E6] hover:text-white hover:bg-[#0D1A3A] focus:bg-[#0D1A3A] focus:text-white cursor-pointer"
          >
            {it.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

