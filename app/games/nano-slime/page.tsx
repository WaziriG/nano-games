import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "NANO SLIME" }

export default function NanoSlimePage() {
  return <GameFrame slug="nano-slime" />
}
