import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "LUFFY'S SURVIVAL QUEST" }

export default function LuffysQuestPage() {
  return <GameFrame slug="luffys-quest" />
}
