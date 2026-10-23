import { neon } from '@neondatabase/serverless'

export interface LeaderboardEntry {
  id: number
  game_slug: string
  player_name: string
  score: number
  kills: number
  level: number
  created_at: string
}

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function getTopScores(gameSlug: string, limit = 15, level?: number): Promise<LeaderboardEntry[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, game_slug, player_name, score, kills, level, created_at
    FROM leaderboard
    WHERE game_slug = ${gameSlug} AND (${level ?? null}::int IS NULL OR level = ${level ?? null}::int)
    ORDER BY score DESC, kills DESC, created_at ASC
    LIMIT ${limit}
  `
  return rows as LeaderboardEntry[]
}

export async function insertScore(params: {
  gameSlug: string
  playerName: string
  score: number
  kills: number
  level: number
}): Promise<LeaderboardEntry> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO leaderboard (game_slug, player_name, score, kills, level)
    VALUES (${params.gameSlug}, ${params.playerName}, ${params.score}, ${params.kills}, ${params.level})
    RETURNING id, game_slug, player_name, score, kills, level, created_at
  `
  return rows[0] as LeaderboardEntry
}
