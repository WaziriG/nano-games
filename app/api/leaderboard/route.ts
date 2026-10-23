import { NextRequest, NextResponse } from 'next/server'
import { getTopScores, insertScore } from '@/lib/db'
import { getGame } from '@/lib/games'

/* A game is submittable only if the registry gives it a leaderboard config —
   that config also supplies the caps, so validation and the UI can't drift. */
function boardFor(slug: unknown) {
  if (typeof slug !== 'string') return null
  return getGame(slug)?.leaderboard ?? null
}

export async function GET(req: NextRequest) {
  const game = req.nextUrl.searchParams.get('game') ?? ''
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '15', 10) || 15, 50)

  const board = boardFor(game)
  if (!board) {
    return NextResponse.json({ error: 'Unknown game' }, { status: 400 })
  }

  const levelParam = req.nextUrl.searchParams.get('level')
  let level: number | undefined
  if (levelParam !== null) {
    level = Number(levelParam)
    if (!board.levelNames || !Number.isInteger(level) || level < 1 || level > board.levelNames.length) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
    }
  }

  try {
    const entries = await getTopScores(game, limit, level)
    return NextResponse.json({ entries })
  } catch {
    return NextResponse.json({ entries: [], error: 'Database unavailable' }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { game, playerName, score, kills, level } = body as Record<string, unknown>

  const board = boardFor(game)
  if (!board) {
    return NextResponse.json({ error: 'Invalid game' }, { status: 400 })
  }
  const { limits, statLabels } = board

  if (typeof playerName !== 'string' || playerName.trim().length < 1 || playerName.trim().length > 20) {
    return NextResponse.json({ error: 'Name must be 1–20 characters' }, { status: 400 })
  }

  const checks: Array<[unknown, number, string]> = [
    [score, limits.maxScore, statLabels.score],
    [kills, limits.maxKills, statLabels.kills],
    [level, limits.maxLevel, statLabels.level],
  ]
  for (const [value, max, label] of checks) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > max) {
      return NextResponse.json({ error: `Invalid ${label.toLowerCase()}` }, { status: 400 })
    }
  }

  const cleanName = playerName.trim().replace(/[^\w\s\-\.]/g, '').slice(0, 20) || 'ANON'

  try {
    const entry = await insertScore({
      gameSlug: game as string,
      playerName: cleanName,
      score: score as number,
      kills: kills as number,
      level: level as number,
    })
    return NextResponse.json({ entry }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
  }
}
