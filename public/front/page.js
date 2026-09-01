/* Nano Games front page — the machine's own logic.
   Engine untouched: everything here reads --sc-p and the page's own state. */
(function () {
  'use strict'
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  var $ = function (s) { return document.querySelector(s) }

  /* ---------- degauss: remove the flash element once it has played ---------- */
  var deg = $('#degauss')
  if (deg) setTimeout(function () { deg.remove() }, 1400)

  /* ---------- cabinet screens: play only while visible ---------- */
  /* the featured CRT gets the phone encode on phones */
  var crt = document.querySelector('.crt__video')
  if (crt && matchMedia('(max-width: 700px)').matches) crt.src = '/front/cab-aqua-m.mp4'

  var vids = document.querySelectorAll('video[data-vis]')
  if (reduced) {
    /* posters hold; attract mode does not run for a reader who asked for stillness */
    vids.forEach(function (v) { v.removeAttribute('autoplay'); v.pause() })
  } else if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}) }
        else v.pause()
      })
    }, { threshold: 0.15 })
    vids.forEach(function (v) { vio.observe(v) })
  } else {
    vids.forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}) })
  }

  /* ---------- hi-score ticker + live leaderboard ----------
     Baked rows are the production database's real state as of Aug 31 2026.
     If the machine can reach its own API, the board goes LIVE. */
  var ticker = $('#osdTicker')
  var tickerRows = [
    'HI-SCORE · CYRUS 5,250 · ELEMENTAL TRIALS',
    'HI-SCORE · DEKE 3,150 · HAUNTED MANSION',
    'HI-SCORE · DEKE 77 · AQUATIC SURVIVAL',
  ]
  var tickerI = 0
  setInterval(function () {
    if (!ticker) return
    tickerI = (tickerI + 1) % tickerRows.length
    ticker.textContent = tickerRows[tickerI]
  }, 4000)

  var fmt = function (n) { return Number(n).toLocaleString('en-US') }

  function liveBoards() {
    var boards = [
      { slug: 'elemental-trials', name: 'ELEMENTAL TRIALS', unit: 'SCORE' },
      { slug: 'haunted-mansion', name: 'HAUNTED MANSION', unit: 'SCORE' },
      { slug: 'aqua-survivor', name: 'AQUATIC SURVIVAL', unit: 'TIME' },
    ]
    var empties = [
      { slug: 'nano-slime', name: 'NANO SLIME' },
      { slug: 'anthill', name: 'ANTHILL' },
      { slug: 'luffys-quest', name: "LUFFY'S QUEST" },
      { slug: 'quadratic-quest', name: 'QUADRATIC QUEST' },
    ]
    var ctl = 'AbortController' in window ? new AbortController() : null
    if (ctl) setTimeout(function () { ctl.abort() }, 4500)
    var get = function (slug) {
      return fetch('/api/leaderboard?game=' + slug + '&limit=3', ctl ? { signal: ctl.signal } : {})
        .then(function (r) { if (!r.ok) throw 0; return r.json() })
        .then(function (j) { return j.entries || [] })
    }
    Promise.all(boards.concat(empties).map(function (b) { return get(b.slug) }))
      .then(function (all) {
        /* only claim LIVE when the board actually answered with rows */
        var anyRows = all.slice(0, boards.length).some(function (e) { return e.length })
        if (!anyRows) throw 0
        var bootLb = $('#bootLb'); if (bootLb) bootLb.innerHTML = 'LEADERBOARD LINK ........ <b class="boot__ok">ONLINE</b>'
        var mode = $('#lbMode'); if (mode) mode.textContent = 'LIVE FROM THE BOARD'
        var newTicker = []
        boards.forEach(function (b, i) {
          var entries = all[i]
          if (!entries.length) return
          var el = $('#board-' + b.slug); if (!el) return
          var rows = entries.map(function (e, r) {
            return '<div class="scores__row"><span class="r font-vt">' + (r + 1) + '</span><span class="n font-vt">' +
              String(e.player_name || 'ANON').toUpperCase().replace(/[<>&]/g, '') + '</span><span class="s font-vt">' +
              fmt(e.score) + '</span><span class="u font-vt">' + b.unit + '</span></div>'
          }).join('')
          if (b.slug === 'elemental-trials') rows += '<div class="scores__row scores__row--you"><span class="r font-vt">?</span><span class="n font-vt">YOUR NAME HERE</span><span class="s font-vt">— — —</span><span class="u font-vt"></span></div>'
          el.innerHTML = '<p class="scores__game">' + b.name + '</p>' + rows
          newTicker.push('HI-SCORE · ' + String(entries[0].player_name).toUpperCase() + ' ' + fmt(entries[0].score) + ' · ' + b.name)
        })
        var stillEmpty = empties.filter(function (b, i) { return !all[boards.length + i].length })
        var emptyEl = $('#lbEmpty')
        if (emptyEl) {
          if (stillEmpty.length) emptyEl.innerHTML = '<b>' + stillEmpty.map(function (b) { return b.name }).join(' · ') + '</b> — no scores yet. Be first.'
          else emptyEl.remove()
        }
        if (newTicker.length) tickerRows = newTicker
      })
      .catch(function () {
        var bootLb = $('#bootLb'); if (bootLb) bootLb.innerHTML = 'LEADERBOARD LINK ........ <b>SNAPSHOT (AUG 31 2026)</b>'
      })
  }
  if (window.fetch) liveBoards()

  /* ---------- the doors: GAME SELECT opens as you arrive ---------- */
  var doors = $('#doors'), doorL = $('#doorL'), doorR = $('#doorR'), selectScene = $('#game-select')
  function driveDoors() {
    if (!doors || !selectScene) return
    if (reduced) { doors.classList.add('is-open'); return }
    var r = selectScene.getBoundingClientRect()
    var vh = innerHeight
    /* linear and mechanical, like real cabinet doors on a track */
    var p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.55)))
    doorL.style.transform = 'translateX(' + (-102 * p) + '%)'
    doorR.style.transform = 'translateX(' + (102 * p) + '%)'
    doors.classList.toggle('is-open', p >= 1)
  }

  /* ---------- NANO PILOT: the wheel is the joystick ---------- */
  var act = $('#pilot')
  var canvas = $('#pilotCanvas')
  var scoreEl = $('#pilotScore'), finalEl = $('#pilotFinal'), stateEl = $('#pilotState')
  var runScore = 0, best = 0

  function startPilot() {
    if (!canvas || reduced) return
    var ctx = canvas.getContext('2d')
    var dpr = Math.min(2, devicePixelRatio || 1)
    var W = 0, H = 0
    function resize() {
      var r = canvas.getBoundingClientRect()
      var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height))
      if (w === W && h === H) return
      W = w; H = h
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize(); addEventListener('resize', resize)
    /* the engine sizes the stage after this script runs: track the real box */
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas)
    else setTimeout(resize, 400)

    /* the green pilot — the sprite the SPRITE FORGE cabinet clip draws */
    var SPRITE = [
      '00100000100',
      '00010001000',
      '00111111100',
      '01121112110',
      '11111111111',
      '10111111101',
      '10100000101',
      '00011011000',
    ]
    var PX = 4
    var shipW = SPRITE[0].length * PX, shipH = SPRITE.length * PX

    var stars = []
    for (var i = 0; i < 70; i++) stars.push({ x: Math.random(), y: Math.random(), s: Math.random() < 0.75 ? 1 : 2, v: 0.4 + Math.random() * 1.2 })

    var rocks = [], lastSpawn = 0, spawnGap = 1100
    var shipY = 0.5, hitFlash = 0, invuln = 0, scoreClock = 0
    var armed = false, complete = false, wasBelow = true

    function drawShip(x, y, blink) {
      if (blink && Math.floor(performance.now() / 90) % 2) return
      for (var r = 0; r < SPRITE.length; r++) for (var c = 0; c < SPRITE[r].length; c++) {
        var ch = SPRITE[r][c]
        if (ch === '0') continue
        ctx.fillStyle = ch === '2' ? '#05070a' : '#8fd07a'
        ctx.fillRect(x + c * PX, y + r * PX, PX, PX)
      }
      /* thruster */
      ctx.fillStyle = '#3fd2e6'
      if (Math.floor(performance.now() / 120) % 2) ctx.fillRect(x - PX * 2, y + shipH / 2 - PX, PX * 2, PX * 2)
    }

    function drawRock(k) {
      ctx.fillStyle = '#2c4356'
      var s = k.r
      ctx.fillRect(k.x - s, k.y - s * 0.6, s * 2, s * 1.2)
      ctx.fillRect(k.x - s * 0.6, k.y - s, s * 1.2, s * 2)
      ctx.fillStyle = '#4a6a80'
      ctx.fillRect(k.x - s * 0.6, k.y - s * 0.6, s * 0.7, s * 0.7)
    }

    var last = performance.now()
    function frame(now) {
      var dt = Math.min(50, now - last); last = now
      var p = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p')) || 0

      /* lifecycle: arm on first real progress, complete near the end,
         reset for a fresh run if the reader scrolls back above the act */
      if (p < 0.015) { wasBelow = true; if (complete) { complete = false; runScore = 0; rocks = [] } }
      if (!armed && wasBelow && p > 0.02 && p < 0.9) { armed = true; wasBelow = false; runScore = 0; rocks = []; scoreClock = 0 }
      if (armed && p >= 0.72 && !complete) {
        complete = true; armed = false
        best = Math.max(best, runScore)
        if (finalEl) finalEl.textContent = fmt(runScore)
        var sr = $('#serviceRun'), ss = $('#serviceScore')
        if (sr && ss) { ss.textContent = fmt(runScore); sr.hidden = false }
        if (stateEl) stateEl.textContent = 'NANO PILOT · RUN COMPLETE'
      }

      var visible = p > 0.001 && p < 0.999
      if (!visible) { requestAnimationFrame(frame); return }

      ctx.clearRect(0, 0, W, H)

      /* starfield */
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i]
        st.x -= st.v * dt / 4000
        if (st.x < 0) st.x += 1
        ctx.fillStyle = st.s === 2 ? 'rgba(125,249,255,.8)' : 'rgba(223,250,255,.35)'
        ctx.fillRect(st.x * W, st.y * H, st.s, st.s)
      }

      var pad = 70
      var targetY = pad + p * (H - 2 * pad) - shipH / 2
      shipY += (targetY - shipY) * 0.14
      var shipX = Math.round(W * 0.16)

      if (armed) {
        /* spawn */
        if (now - lastSpawn > spawnGap) {
          lastSpawn = now
          spawnGap = 850 + Math.random() * 500
          var ry = 50 + Math.random() * (H - 100)
          rocks.push({ x: W + 30, y: ry, r: 12 + Math.random() * 12, v: W / 340 })
        }
        /* score: alive time */
        scoreClock += dt
        while (scoreClock >= 600) { scoreClock -= 600; runScore += 10; if (scoreEl) scoreEl.textContent = fmt(runScore) }
      }

      /* rocks always drift while the stage shows */
      for (var j = rocks.length - 1; j >= 0; j--) {
        var k = rocks[j]
        k.x -= k.v * dt / 16.7
        if (k.x < -40) { rocks.splice(j, 1); continue }
        drawRock(k)
        if (armed && invuln <= 0) {
          var cx = Math.max(shipX, Math.min(k.x, shipX + shipW))
          var cy = Math.max(shipY, Math.min(k.y, shipY + shipH))
          if ((k.x - cx) * (k.x - cx) + (k.y - cy) * (k.y - cy) < (k.r * 0.8) * (k.r * 0.8)) {
            hitFlash = 1; invuln = 900
            if (stateEl) stateEl.textContent = 'OOF · KEEP SCROLLING'
          }
        }
      }
      if (invuln > 0) invuln -= dt

      drawShip(shipX, shipY, invuln > 0)

      /* the harness cannot read a canvas: publish what actually paints */
      canvas.parentElement.setAttribute('data-sc-verify-state', 'y' + Math.round(shipY) + 's' + runScore + 'r' + rocks.length)

      if (hitFlash > 0) {
        ctx.fillStyle = 'rgba(255,107,107,' + (hitFlash * 0.25) + ')'
        ctx.fillRect(0, 0, W, H)
        hitFlash -= dt / 400
      }

      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }
  if (act && canvas) startPilot()

  /* ---------- keyboard: the aisle's link lives at the rail's far end ----------
     A pinned pan act cannot be centred into visibility; park the act at the
     progress where the rail has fully travelled so the focused link is on screen. */
  var aisleAct = document.querySelector('.scene--aisle')
  var aisleLink = aisleAct && aisleAct.querySelector('.aisle__note a')
  if (aisleAct && aisleLink) aisleLink.addEventListener('focus', function () {
    var top = aisleAct.offsetTop + aisleAct.offsetHeight - innerHeight
    scrollTo({ top: top, behavior: 'instant' })
  })

  /* ---------- one rAF-throttled scroll listener for the doors ---------- */
  var ticking = false
  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(function () { driveDoors(); ticking = false })
  }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  driveDoors()

  /* ---------- mount the engine ---------- */
  if (window.ScrollCraft) ScrollCraft.mount(document.body)
})()
