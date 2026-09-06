import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "AQUATIC SURVIVAL" }

export default function AquaSurvivorPage() {
  return <GameFrame slug="aqua-survivor" />
}
