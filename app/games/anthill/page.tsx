import type { Metadata } from "next"
import { GameFrame } from "@/components/GameFrame"

export const metadata: Metadata = { title: "ANTHILL" }

export default function AnthillPage() {
  return <GameFrame slug="anthill" />
}
