import type { Game } from '@/components/GameCard'

/* The three integer columns on the leaderboard table are generic. Each game
   decides what they mean and what to call them — score is what the board
   ranks on, the other two are shown alongside and break ties. */
export interface LeaderboardConfig {
  statLabels: { score: string; kills: string; level: string }
  limits: { maxScore: number; maxKills: number; maxLevel: number }
  winText: string
  loseText: string
  /* Idle games never reach a game over, so the frame has to ask them
     for a standing instead of waiting to be told. */
  submitMode?: 'run-end' | 'on-demand'
  /* Games that shipped before the shared frame each emit their own event
     name. New games use the standard 'nano-game-over'. */
  legacyEventType?: string
}

export interface GameDef {
  slug: string
  title: string
  /* Lobby cards have room for the full name; the in-game top bar does not. */
  shortTitle: string
  tagline: string
  description: string
  icon: string
  iconBg: string
  accentColor: string
  /* Bare "r, g, b" so callers can compose rgba() at whatever alpha they need. */
  accentRgb: string
  hoverBorder: string
  live: boolean
  genre: string
  players: string
  leaderboard: LeaderboardConfig | null
}

export const GAMES: GameDef[] = [
  {
    slug: 'bug-fight',
    title: 'BUG FIGHT',
    shortTitle: 'BUG FIGHT',
    tagline: 'Pick a bug. Beat the other four.',
    description:
      'An arena brawler on the forest floor. Choose from five real bugs, each with its own special move, and fight your way up the ladder. Every fight is best of three.',
    icon: '🪲',
    iconBg: '🍂',
    accentColor: '#f5b52e',
    accentRgb: '245, 181, 46',
    hoverBorder: 'rgba(255, 210, 120, 0.9)',
    live: true,
    genre: 'ARENA BRAWLER',
    players: '1P',
    /* Wins and losses only; there is no score yet to rank on. */
    leaderboard: null,
  },
  {
    slug: 'anthill',
    title: 'ANTHILL',
    shortTitle: 'ANTHILL',
    tagline: 'Tap the fruit. Grow the colony.',
    description:
      'A colony that keeps working after you close the tab. Tap the big fruit, hatch new castes, buy permanent gear that stacks across every ant, and hold the line when a raid hits. Come back to eight hours of banked foraging.',
    icon: '🐜',
    iconBg: '🍎',
    accentColor: '#e05340',
    accentRgb: '224, 83, 64',
    hoverBorder: 'rgba(255, 138, 120, 0.9)',
    live: true,
    genre: 'IDLE TAPPER',
    players: '1P',
    leaderboard: {
      /* Ranked on tier reached, not food banked — an idle game scored on raw
         totals just ranks whoever left the tab closed longest. */
      statLabels: { score: 'TIER', kills: 'FOOD', level: 'RAIDS' },
      limits: { maxScore: 50, maxKills: 2000000000, maxLevel: 10000 },
      winText: 'COLONY STANDING',
      loseText: 'COLONY STANDING',
      submitMode: 'on-demand',
    },
  },
  {
    slug: 'nano-slime',
    title: 'NANO SLIME',
    shortTitle: 'NANO SLIME',
    tagline: 'Eat. Grow. Evolve.',
    description:
      'Start as a speck in the grass and eat your way up the food chain. Unlock new slime forms, stockpile acorns and pumpkins, earn costumes, and chase your best form ever — with a hardcore mode and a sandbox for testing builds.',
    icon: '🦠',
    iconBg: '🌿',
    accentColor: '#8fd07a',
    accentRgb: '143, 208, 122',
    hoverBorder: 'rgba(190, 240, 170, 0.9)',
    live: true,
    genre: 'GROWTH',
    players: '1P',
    leaderboard: {
      statLabels: { score: 'FORM', kills: 'GOO', level: 'PUMPKINS' },
      limits: { maxScore: 100, maxKills: 1000000, maxLevel: 100000 },
      winText: 'APEX SLIME',
      loseText: 'RUN OVER',
    },
  },
  {
    slug: 'aqua-survivor',
    title: 'AQUATIC SURVIVAL',
    shortTitle: 'AQUATIC SURVIVAL',
    tagline: 'Survive the deep. Battle the bosses.',
    description:
      'Top-down arena survival. Play as Aqua the tuxedo turtle across two worlds — underwater gauntlet and the surface land. Dozens of bosses. How long can you last?',
    icon: '🐢',
    iconBg: '🌊',
    accentColor: '#3fd2e6',
    accentRgb: '63, 210, 230',
    hoverBorder: 'rgba(125, 249, 255, 0.9)',
    live: true,
    genre: 'SURVIVAL',
    players: '1P',
    leaderboard: {
      statLabels: { score: 'TIME', kills: 'KILLS', level: 'LVL' },
      limits: { maxScore: 7200, maxKills: 9999, maxLevel: 200 },
      winText: 'GAME OVER',
      loseText: 'GAME OVER',
      legacyEventType: 'aqua-game-over',
    },
  },
  {
    slug: 'elemental-trials',
    title: 'ELEMENTAL TRIALS',
    shortTitle: 'ELEMENTAL TRIALS',
    tagline: 'Seven guardians. One gauntlet.',
    description:
      'Battle 7 elemental guardians (and a hidden Void Universe of 5 more) across themed arenas. Collect and merge weapons, exploit boss weaknesses, and loop endlessly as bosses grow stronger.',
    icon: '⚔️',
    iconBg: '🔥',
    accentColor: '#ff6b6b',
    accentRgb: '255, 107, 107',
    hoverBorder: 'rgba(255, 157, 157, 0.9)',
    live: true,
    genre: 'BOSS RUSH',
    players: '1P',
    leaderboard: {
      statLabels: { score: 'SCORE', kills: 'BOSSES', level: 'STAGE' },
      limits: { maxScore: 500000, maxKills: 999, maxLevel: 200 },
      winText: 'ALL GUARDIANS FELL',
      loseText: 'YOU FELL',
      legacyEventType: 'elemental-game-over',
    },
  },
  {
    slug: 'haunted-mansion',
    title: 'HAUNTED MANSION',
    shortTitle: 'HAUNTED MANSION',
    tagline: 'Four rooms. One way out.',
    description:
      'Search a cursed mansion for keys, dodge spiders, smash cursed mirrors, and outrun the monster in the final chase. Find weapons, armor, and the rare Totem before the night ends you.',
    icon: '🏚️',
    iconBg: '🌕',
    accentColor: '#ffd166',
    accentRgb: '255, 209, 102',
    hoverBorder: 'rgba(255, 224, 153, 0.9)',
    live: true,
    genre: 'SURVIVAL HORROR',
    players: '1P',
    leaderboard: {
      statLabels: { score: 'SCORE', kills: 'SPIDERS', level: 'ROOM' },
      limits: { maxScore: 20000, maxKills: 200, maxLevel: 4 },
      winText: 'YOU ESCAPED',
      loseText: 'YOU DIED',
      legacyEventType: 'haunted-game-over',
    },
  },
  {
    slug: 'luffys-quest',
    title: "LUFFY'S SURVIVAL QUEST",
    shortTitle: "LUFFY'S QUEST",
    tagline: 'Become King of the Pirates.',
    description:
      'Fight through 4 islands — The Town, Sky Island, Volcano Island, and Monkey Island. Master 6 powers from Lightning to Gear 5 Nika Mode, freeze crowds with Conqueror’s Haki, and take down every boss.',
    icon: '👒',
    iconBg: '🏴‍☠️',
    accentColor: '#ff9f43',
    accentRgb: '255, 159, 67',
    hoverBorder: 'rgba(255, 190, 118, 0.9)',
    live: true,
    genre: 'SURVIVAL',
    players: '1P',
    leaderboard: {
      statLabels: { score: 'SCORE', kills: 'WAVES', level: 'ISLAND' },
      limits: { maxScore: 1000000, maxKills: 9999, maxLevel: 4 },
      winText: 'KING OF THE PIRATES',
      loseText: 'YOU FELL',
    },
  },
  {
    slug: 'quadratic-quest',
    title: "ADRIAN'S QUADRATIC QUEST",
    shortTitle: 'QUADRATIC QUEST',
    tagline: 'Solve the equation. Blast through the gate.',
    description:
      'An endless run across an alien planet — double-jump over space rocks and slimes, grab crystals, and outrun the dark. Every so often a MATH GATE blocks the path, and only the right root of the quadratic opens it.',
    icon: '🚀',
    iconBg: '🪐',
    accentColor: '#a78bfa',
    accentRgb: '167, 139, 250',
    hoverBorder: 'rgba(199, 180, 255, 0.9)',
    live: true,
    genre: 'MATH RUNNER',
    players: '1P',
    leaderboard: {
      statLabels: { score: 'SCORE', kills: 'GATES', level: 'DISTANCE' },
      limits: { maxScore: 1000000, maxKills: 9999, maxLevel: 10000000 },
      winText: 'RUN COMPLETE',
      loseText: 'GAME OVER',
    },
  },
  {
    slug: 'sprite-forge',
    title: 'SPRITE FORGE',
    shortTitle: 'SPRITE FORGE',
    tagline: 'Draw your own monsters.',
    description:
      'A touch-friendly pixel-art editor built for making game characters. Draw sprites on a grid, save a gallery, and export paste-ready code to drop into any canvas game.',
    icon: '🖌️',
    iconBg: '🎨',
    accentColor: '#3fd2e6',
    accentRgb: '63, 210, 230',
    hoverBorder: 'rgba(125, 249, 255, 0.9)',
    live: true,
    genre: 'TOOL',
    players: '1P',
    /* A drawing tool has no run to score. */
    leaderboard: null,
  },
]

const BY_SLUG = new Map(GAMES.map(g => [g.slug, g]))

export function getGame(slug: string): GameDef | undefined {
  return BY_SLUG.get(slug)
}

/** The game as the lobby card wants it — derives the alpha variants. */
export function toCardGame(g: GameDef): Game {
  return {
    slug: g.slug,
    title: g.title,
    tagline: g.tagline,
    description: g.description,
    icon: g.icon,
    iconBg: g.iconBg,
    accentColor: g.accentColor,
    glowColor: `rgba(${g.accentRgb}, 0.35)`,
    borderColor: `rgba(${g.accentRgb}, 0.5)`,
    hoverBorder: g.hoverBorder,
    href: `/games/${g.slug}`,
    live: g.live,
    genre: g.genre,
    players: g.players,
  }
}
