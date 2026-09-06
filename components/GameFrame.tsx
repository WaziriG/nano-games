'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getGame } from '@/lib/games'

interface GameResult {
  score: number
  kills: number
  level: number
  reason?: 'win' | 'dead'
}

interface LeaderboardEntry {
  id: number
  player_name: string
  score: number
  kills: number
  level: number
  created_at: string
}

export function GameFrame({ slug }: { slug: string }) {
  const game = getGame(slug)
  if (!game) throw new Error(`Unknown game: ${slug}`)

  const board = game.leaderboard
  const accent = game.accentColor
  const rgb = game.accentRgb

  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLB, setLoadingLB] = useState(false)
  const [submitName, setSubmitName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  /* On-demand games are asked for their standing; the reply comes back
     through the same nano-game-over listener below. */
  function requestScore() {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'nano-request-score', game: slug },
      '*',
    )
  }

  const fetchLeaderboard = useCallback(async () => {
    setLoadingLB(true)
    try {
      const res = await fetch(`/api/leaderboard?game=${slug}&limit=15`)
      const data = await res.json()
      setLeaderboard(data.entries ?? [])
    } catch {
      setLeaderboard([])
    } finally {
      setLoadingLB(false)
    }
  }, [slug])

  useEffect(() => {
    if (!board) return

    function onMessage(e: MessageEvent) {
      const data = e.data
      if (typeof data !== 'object' || data === null) return

      /* Standard event carries its own slug so one listener can't be spoofed
         by a different game's frame; legacy events predate that field. */
      const isStandard = data.type === 'nano-game-over' && data.game === slug
      const isLegacy = board!.legacyEventType && data.type === board!.legacyEventType
      if (!isStandard && !isLegacy) return

      const { score, kills, level, reason } = data as GameResult & { type: string }
      if (typeof score !== 'number') return

      setGameResult({ score, kills: kills ?? 0, level: level ?? 0, reason })
      setSubmitted(false)
      setSubmitName('')
      setSubmitError('')
      setShowScoreModal(true)
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [slug, board])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gameResult || !submitName.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: slug,
          playerName: submitName.trim(),
          score: gameResult.score,
          kills: gameResult.kills,
          level: gameResult.level,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to submit')
      }
      setSubmitted(true)
      await fetchLeaderboard()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save score')
    } finally {
      setSubmitting(false)
    }
  }

  function openLeaderboard() {
    setShowLeaderboard(true)
    fetchLeaderboard()
  }

  const labels = board?.statLabels

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: '#080e14' }}>
      <a href="#main" className="skip-link">Skip to the game</a>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'rgba(8,14,20,0.95)', borderBottom: `1px solid rgba(${rgb},0.25)` }}
      >
        <Link
          href="/"
          className="font-pixel flex items-center gap-2 no-underline min-h-11"
          style={{ fontSize: '12px', color: accent, letterSpacing: '1px' }}
        >
          ◄ ARCADE
        </Link>

        <div
          className="font-pixel text-center"
          style={{ fontSize: 'clamp(12px,1.5vw,14px)', color: accent, letterSpacing: '2px' }}
        >
          {game.shortTitle}
        </div>

        {board ? (
          <div className="flex gap-3">
            <button
              onClick={openLeaderboard}
              className="font-pixel rounded px-3 py-2 min-h-11 cursor-pointer"
              style={{
                fontSize: '12px',
                color: accent,
                background: `rgba(${rgb},0.1)`,
                border: `1px solid rgba(${rgb},0.4)`,
                letterSpacing: '1px',
              }}
            >
              🏆 SCORES
            </button>
            {(board.submitMode === 'on-demand' || (gameResult && !showScoreModal)) && (
              <button
                onClick={board.submitMode === 'on-demand' ? requestScore : () => setShowScoreModal(true)}
                className="font-pixel rounded px-3 py-2 min-h-11 cursor-pointer"
                style={{
                  fontSize: '12px',
                  color: '#080e14',
                  background: accent,
                  border: `1px solid ${game.hoverBorder}`,
                  letterSpacing: '1px',
                }}
              >
                SUBMIT SCORE
              </button>
            )}
          </div>
        ) : (
          <div style={{ width: '70px' }} />
        )}
      </div>

      {/* Game iframe */}
      <main id="main" tabIndex={-1} className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={`/games/${slug}.html`}
          title={game.title}
          className="absolute inset-0 w-full h-full border-0"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
        />
      </main>

      {/* Score submission modal */}
      {board && labels && showScoreModal && gameResult && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,10,18,0.88)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowScoreModal(false) }}
        >
          <div
            className="rounded-xl p-6 w-full max-w-sm"
            style={{ background: '#0d1b2a', border: `2px solid rgba(${rgb},0.5)`, boxShadow: `0 0 40px rgba(${rgb},0.2)` }}
          >
            {!submitted ? (
              <>
                <div className="font-pixel text-center mb-1" style={{ fontSize: '12px', color: accent, letterSpacing: '2px' }}>
                  {gameResult.reason === 'win' ? board.winText : board.loseText}
                </div>
                <div className="font-vt text-center mb-4" style={{ fontSize: '20px', color: 'var(--foam)', opacity: 0.7 }}>
                  Submit your run to the leaderboard
                </div>

                <div
                  className="rounded-lg p-4 mb-5 grid grid-cols-3 gap-3 text-center"
                  style={{ background: 'rgba(8,14,20,0.8)', border: `1px solid rgba(${rgb},0.2)` }}
                >
                  <StatCell accent={accent} label={labels.score} value={String(gameResult.score)} />
                  <StatCell accent={accent} label={labels.kills} value={String(gameResult.kills)} />
                  <StatCell accent={accent} label={labels.level} value={String(gameResult.level)} />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="ENTER YOUR NAME"
                    value={submitName}
                    onChange={e => setSubmitName(e.target.value)}
                    maxLength={20}
                    autoFocus
                    className="w-full rounded px-4 py-3 font-pixel outline-none"
                    style={{
                      fontSize: '12px',
                      background: '#080e14',
                      border: `2px solid rgba(${rgb},0.4)`,
                      color: accent,
                      letterSpacing: '2px',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = accent }}
                    onBlur={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.4)` }}
                  />
                  {submitError && (
                    <div className="font-vt text-center" style={{ color: 'var(--coral)', fontSize: '16px' }}>
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !submitName.trim()}
                    className="font-pixel rounded py-3 cursor-pointer disabled:opacity-40"
                    style={{
                      fontSize: '12px',
                      color: '#080e14',
                      background: `linear-gradient(180deg, ${game.hoverBorder}, ${accent})`,
                      border: '2px solid var(--foam)',
                      letterSpacing: '2px',
                    }}
                  >
                    {submitting ? 'SAVING...' : 'SUBMIT →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScoreModal(false)}
                    className="font-pixel text-center cursor-pointer"
                    style={{ fontSize: '12px', color: 'var(--muted)', background: 'none', border: 'none', letterSpacing: '1px' }}
                  >
                    SKIP
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
                <div className="font-pixel mb-2" style={{ fontSize: '12px', color: accent, letterSpacing: '2px' }}>
                  SCORE SAVED!
                </div>
                <div className="font-vt mb-4" style={{ fontSize: '20px', color: 'var(--foam)', opacity: 0.8 }}>
                  {submitName.toUpperCase()} — {gameResult.score}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setShowScoreModal(false); setShowLeaderboard(true) }}
                    className="font-pixel rounded px-4 py-2 cursor-pointer"
                    style={{ fontSize: '12px', color: accent, background: `rgba(${rgb},0.15)`, border: `1px solid rgba(${rgb},0.5)` }}
                  >
                    VIEW SCORES
                  </button>
                  <button
                    onClick={() => setShowScoreModal(false)}
                    className="font-pixel rounded px-4 py-2 cursor-pointer"
                    style={{ fontSize: '12px', color: accent, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.4)` }}
                  >
                    KEEP PLAYING
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard modal */}
      {board && labels && showLeaderboard && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,10,18,0.9)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowLeaderboard(false) }}
        >
          <div
            className="rounded-xl w-full max-w-lg overflow-hidden"
            style={{ background: '#0d1b2a', border: `2px solid rgba(${rgb},0.5)`, boxShadow: `0 0 40px rgba(${rgb},0.15)` }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ background: 'rgba(8,14,20,0.8)', borderBottom: `1px solid rgba(${rgb},0.2)` }}
            >
              <div className="font-pixel" style={{ fontSize: '12px', color: accent, letterSpacing: '2px' }}>
                🏆 TOP SCORES
              </div>
              <div className="font-vt" style={{ fontSize: '16px', color: 'var(--muted)' }}>
                {game.shortTitle}
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="font-pixel cursor-pointer"
                style={{ fontSize: '12px', color: 'var(--muted)', background: 'none', border: 'none' }}
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
              {loadingLB ? (
                <div className="font-pixel text-center py-12" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  LOADING...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="font-pixel mb-2" style={{ fontSize: '12px', color: 'var(--muted)' }}>NO SCORES YET</div>
                  <div className="font-vt" style={{ fontSize: '18px', color: accent, opacity: 0.7 }}>Be the first to submit!</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `1px solid rgba(${rgb},0.2)` }}>
                        {['#', 'PLAYER', labels.score, labels.kills, labels.level].map(h => (
                          <th key={h} className="font-pixel px-4 py-2 text-left"
                            style={{ fontSize: '12px', color: `rgba(${rgb},0.6)`, letterSpacing: '1px' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, i) => (
                        <tr
                          key={entry.id}
                          style={{
                            borderBottom: `1px solid rgba(${rgb},0.08)`,
                            background: i === 0 ? `rgba(${rgb},0.06)` : 'transparent',
                          }}
                        >
                          <td className="font-pixel px-4 py-3"
                            style={{ fontSize: '12px', color: i === 0 ? accent : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : 'var(--muted)' }}>
                            {i === 0 ? '👑' : `${i + 1}`}
                          </td>
                          <td className="font-pixel px-4 py-3"
                            style={{ fontSize: '12px', color: 'var(--foam)', opacity: i === 0 ? 1 : 0.8 }}>
                            {entry.player_name.toUpperCase()}
                          </td>
                          <td className="font-pixel px-4 py-3" style={{ fontSize: '12px', color: accent }}>
                            {entry.score}
                          </td>
                          <td className="font-pixel px-4 py-3" style={{ fontSize: '12px', color: 'var(--foam)', opacity: 0.7 }}>
                            {entry.kills}
                          </td>
                          <td className="font-pixel px-4 py-3" style={{ fontSize: '12px', color: 'var(--foam)', opacity: 0.7 }}>
                            {entry.level}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              className="px-6 py-3 flex items-center justify-between"
              style={{ borderTop: `1px solid rgba(${rgb},0.15)` }}
            >
              <div className="font-vt" style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Sorted by {labels.score.toLowerCase()}
              </div>
              <button
                onClick={fetchLeaderboard}
                className="font-pixel cursor-pointer"
                style={{ fontSize: '12px', color: accent, background: 'none', border: 'none' }}
              >
                ↻ REFRESH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div>
      <div className="font-pixel" style={{ fontSize: '14px', color: accent }}>{value}</div>
      <div className="font-pixel mt-1" style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px' }}>{label}</div>
    </div>
  )
}
