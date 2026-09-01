import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Script from 'next/script'
import { GameCard } from '@/components/GameCard'
import { GAMES, toCardGame } from '@/lib/games'

/* The scroll experience is authored as static HTML (see scrollcraft build
   `nano-games`); mounting it as a route keeps layout.tsx in charge of fonts,
   metadata, analytics and the CRT overlays. The GAME SELECT close renders the
   real GameCard grid, so the front page ends inside the actual product. */
const chrome = readFileSync(join(process.cwd(), 'app/front/chrome.html'), 'utf8')
const scenes = readFileSync(join(process.cwd(), 'app/front/scenes.html'), 'utf8')

export default function FrontPage() {
  return (
    <>
      <link rel="stylesheet" href="/front/scrollcraft.css" />
      <link rel="stylesheet" href="/front/page.css" />
      <div dangerouslySetInnerHTML={{ __html: chrome }} />
      <main id="top">
        <div dangerouslySetInnerHTML={{ __html: scenes }} />
        <section className="scene scene--select" id="game-select">
          <div className="doors" id="doors" aria-hidden>
            <div className="doors__l" id="doorL" />
            <div className="doors__r" id="doorR" />
          </div>
          <div className="sc-wrap select">
            <header className="select__head" data-sc-in="">
              <p className="scene__label">GAME SELECT</p>
              <h2 className="font-pixel glow-aqua">PICK YOUR CABINET</h2>
              <p className="font-vt">8 games. Free play. Right now.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {GAMES.map(game => (
                <GameCard key={game.slug} game={toCardGame(game)} />
              ))}
            </div>
            <footer className="select__foot">
              <p className="f1">DESIGNED &amp; BUILT BY CYRUS &nbsp;&middot;&nbsp; NANO GAMES &copy; 2026</p>
              <p className="f2 font-vt">INSERT COIN TO CONTINUE</p>
            </footer>
          </div>
        </section>
      </main>
      <Script src="/front/scrollcraft.js" strategy="afterInteractive" />
      <Script src="/front/page.js" strategy="afterInteractive" />
    </>
  )
}
