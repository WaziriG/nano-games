import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "HAUNTED MANSION" }

export default function HauntedMansionPage() {
  return <GameFrame slug="haunted-mansion" />
}
