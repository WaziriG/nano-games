import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "ELEMENTAL TRIALS" }

export default function ElementalTrialsPage() {
  return <GameFrame slug="elemental-trials" />
}
