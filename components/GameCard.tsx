'use client'

import Link from 'next/link'

export interface Game {
  slug: string
  title: string
  tagline: string
  description: string
  icon: string
  iconBg: string
  accentColor: string
  glowColor: string
  borderColor: string
  hoverBorder: string
  href: string
  live: boolean
  genre: string
  players: string
}

export function GameCard({ game }: { game: Game }) {
  const inner = (
    <div
      className="game-card rounded-xl p-6 flex flex-col gap-4 h-full cursor-pointer select-none"
      style={{
        background: game.live
          ? `linear-gradient(160deg, rgba(13,27,42,0.95), rgba(8,14,20,0.98))`
          : `rgba(8,14,20,0.6)`,
        border: `2px solid ${game.borderColor}`,
        boxShadow: game.live ? `0 0 24px ${game.glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)` : 'none',
        opacity: game.live ? 1 : 0.55,
      }}
      onMouseEnter={e => {
        if (!game.live) return
        ;(e.currentTarget as HTMLDivElement).style.borderColor = game.hoverBorder
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${game.glowColor}, 0 8px 0 rgba(0,0,0,0.4)`
      }}
      onMouseLeave={e => {
        if (!game.live) return
        ;(e.currentTarget as HTMLDivElement).style.borderColor = game.borderColor
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${game.glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`
      }}
    >
      {/* Badge row */}
      <div className="flex items-center justify-between">
        <span
          className="font-pixel rounded px-2 py-1"
          style={{
            fontSize: '12px',
            color: game.accentColor,
            background: `${game.accentColor}18`,
            border: `1px solid ${game.borderColor}`,
          }}
        >
          {game.genre}
        </span>
        <span className="font-pixel" style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {game.players}
        </span>
      </div>

      {/* Icon */}
      <div className="text-center py-2">
        <div style={{ fontSize: '20px', marginBottom: '2px', opacity: 0.4 }}>{game.iconBg}</div>
        <div
          style={{
            fontSize: '56px',
            lineHeight: 1,
            filter: game.live ? `drop-shadow(0 0 12px ${game.accentColor})` : 'none',
            marginTop: '-20px',
          }}
        >
          {game.icon}
        </div>
      </div>

      {/* Title */}
      <div>
        <div
          className="font-pixel leading-snug"
          style={{
            fontSize: 'clamp(9px, 1.5vw, 11px)',
            color: game.live ? game.accentColor : 'var(--muted)',
            letterSpacing: '1px',
          }}
        >
          {game.title}
        </div>
        <div className="font-vt mt-1" style={{ fontSize: '18px', color: 'var(--foam)', opacity: 0.8 }}>
          {game.tagline}
        </div>
      </div>

      {/* Description */}
      <div className="font-vt flex-1" style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.3 }}>
        {game.description}
      </div>

      {/* CTA */}
      <div className="mt-auto">
        {game.live ? (
          <div
            className="font-pixel text-center rounded py-3 px-4 pulse-glow"
            style={{
              fontSize: '12px',
              color: '#080e14',
              background: `linear-gradient(180deg, ${game.accentColor}, rgba(63,210,230,0.7))`,
              border: `2px solid var(--foam)`,
              letterSpacing: '2px',
            }}
          >
            PLAY NOW
          </div>
        ) : (
          <div
            className="font-pixel text-center rounded py-3 px-4"
            style={{
              fontSize: '12px',
              color: 'var(--muted)',
              border: '2px dashed rgba(74,106,128,0.5)',
              letterSpacing: '2px',
            }}
          >
            COMING SOON
          </div>
        )}
      </div>
    </div>
  )

  if (!game.live) return inner

  return (
    <Link href={game.href} className="block h-full no-underline">
      {inner}
    </Link>
  )
}
