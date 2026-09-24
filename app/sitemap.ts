import type { MetadataRoute } from 'next'
import { GAMES } from '@/lib/games'

const SITE_URL = 'https://nanogames.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const gamePages = GAMES.filter((game) => game.live).map((game) => ({
    url: `${SITE_URL}/games/${game.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/arcade`, changeFrequency: 'weekly', priority: 0.8 },
    ...gamePages,
  ]
}
