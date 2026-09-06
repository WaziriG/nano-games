import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "SPRITE FORGE" }

export default function SpriteForgePage() {
  return <GameFrame slug="sprite-forge" />
}
