import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "BUG FIGHT" }

export default function BugFightPage() {
  return <GameFrame slug="bug-fight" />
}
