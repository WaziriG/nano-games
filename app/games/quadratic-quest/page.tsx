import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "ADRIAN'S QUADRATIC QUEST" }

export default function QuadraticQuestPage() {
  return <GameFrame slug="quadratic-quest" />
}
