'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { GraduationCap } from 'lucide-react'

/* ── physics tuning ── */
const GRAV  = 1200   // px/s²
const FRIC  = 0.985  // velocity damping per frame
const TEAR  = 54     // constraint breaks when stretched beyond this (px)
const GAP   = 18     // rest distance between nodes (px)
const ITERS = 5      // constraint-relaxation passes per frame
const RAD   = 40     // mouse grab radius (px)
const EXIT  = 0.22   // exit when fewer than 22% of constraints remain active

type Pt = { x: number; y: number; px: number; py: number; pin: boolean }
type Cn = { a: number; b: number; rest: number; on: boolean }
interface Cloth { cols: number; rows: number; pts: Pt[]; cns: Cn[]; total: number }

function buildCloth(w: number, h: number): Cloth {
  const cols = Math.floor(w / GAP) + 1
  const rows = Math.floor(h / GAP) + 1
  const pts: Pt[] = []
  const cns: Cn[] = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = c * GAP, y = r * GAP
      pts.push({ x, y, px: x, py: y, pin: r === 0 })
    }
  const I = (r: number, c: number) => r * cols + c
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) cns.push({ a: I(r, c), b: I(r, c + 1), rest: GAP, on: true })
      if (r < rows - 1) cns.push({ a: I(r, c), b: I(r + 1, c), rest: GAP, on: true })
    }
  return { cols, rows, pts, cns, total: cns.length }
}

function stepCloth(cloth: Cloth, dt: number, drag: { i: number; x: number; y: number } | null) {
  const { pts, cns } = cloth
  const dtSq = dt * dt
  const W = window.innerWidth
  const Hmax = window.innerHeight * 3

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    if (p.pin) continue
    if (drag && drag.i === i) {
      p.px = p.x; p.py = p.y
      p.x = drag.x; p.y = drag.y
      continue
    }
    const vx = (p.x - p.px) * FRIC
    const vy = (p.y - p.py) * FRIC
    p.px = p.x; p.py = p.y
    p.x += vx; p.y += vy + GRAV * dtSq
  }

  for (let it = 0; it < ITERS; it++) {
    for (const c of cns) {
      if (!c.on) continue
      const a = pts[c.a], b = pts[c.b]
      const dx = b.x - a.x, dy = b.y - a.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > TEAR) { c.on = false; continue }
      if (!d) continue
      const f = (d - c.rest) / d * 0.5
      if (!a.pin) { a.x += dx * f; a.y += dy * f }
      if (!b.pin) { b.x -= dx * f; b.y -= dy * f }
    }
  }

  for (const p of pts) {
    if (p.pin) continue
    if (p.x < 0)    { p.px = p.x; p.x = 0 }
    if (p.x > W)    { p.px = p.x; p.x = W }
    if (p.y < 0)    { p.py = p.y; p.y = 0 }
    if (p.y > Hmax) { p.py = p.y; p.y = Hmax }
  }
}

function drawCloth(ctx: CanvasRenderingContext2D, cloth: Cloth, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  const { pts, cols, rows } = cloth
  const I = (r: number, c: number) => r * cols + c

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const p00 = pts[I(r, c)], p10 = pts[I(r, c + 1)]
      const p01 = pts[I(r + 1, c)], p11 = pts[I(r + 1, c + 1)]

      if (Math.max(
        Math.hypot(p00.x - p10.x, p00.y - p10.y),
        Math.hypot(p00.x - p01.x, p00.y - p01.y),
        Math.hypot(p10.x - p11.x, p10.y - p11.y),
        Math.hypot(p01.x - p11.x, p01.y - p11.y),
      ) > GAP * 4.5) continue

      let fill: string
      if (r < 3)      fill = 'rgba(7,137,48,0.95)'
      else if (r < 6) fill = 'rgba(252,221,9,0.95)'
      else if (r < 9) fill = 'rgba(218,18,26,0.95)'
      else {
        const t = rows > 10 ? Math.min((r - 9) / (rows - 10), 1) : 0
        fill = `rgba(${Math.round(15 + t * 4)},${Math.round(23 + t * 55)},${Math.round(42 + t * 17)},0.93)`
      }

      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y)
      ctx.lineTo(p10.x, p10.y)
      ctx.lineTo(p11.x, p11.y)
      ctx.lineTo(p01.x, p01.y)
      ctx.closePath()
      ctx.fill()
    }
  }
}

export default function PageLoader() {
  const cvs      = useRef<HTMLCanvasElement>(null)
  const cloth    = useRef<Cloth | null>(null)
  const raf      = useRef(0)
  const last     = useRef(0)
  const drag     = useRef<{ i: number; x: number; y: number } | null>(null)
  const [show, setShow]         = useState(true)
  const [fade, setFade]         = useState(false)
  const [hintGone, setHintGone] = useState(false)

  const leave = useCallback(() => {
    sessionStorage.setItem('ethio_loaded', '1')
    setFade(true)
    setTimeout(() => setShow(false), 700)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('ethio_loaded')) { setShow(false); return }

    const canvas = cvs.current!
    const ctx = canvas.getContext('2d')!

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      cloth.current = buildCloth(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)

    function loop(t: number) {
      const dt = Math.min((t - last.current) / 1000, 0.032)
      last.current = t
      if (!cloth.current) return
      stepCloth(cloth.current, dt, drag.current)
      drawCloth(ctx, cloth.current, canvas.width, canvas.height)
      const alive = cloth.current.cns.reduce((s, c) => s + (c.on ? 1 : 0), 0)
      if (alive < cloth.current.total * EXIT) { leave(); return }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(t => {
      last.current = t
      raf.current = requestAnimationFrame(loop)
    })

    function nearest(x: number, y: number) {
      if (!cloth.current) return -1
      let best = -1, bestD = RAD * RAD
      cloth.current.pts.forEach((p, i) => {
        if (p.pin) return
        const d = (p.x - x) ** 2 + (p.y - y) ** 2
        if (d < bestD) { bestD = d; best = i }
      })
      return best
    }

    function grab(x: number, y: number) {
      const i = nearest(x, y)
      if (i >= 0) {
        drag.current = { i, x, y }
        canvas.style.cursor = 'grabbing'
        setHintGone(true)
      }
    }
    function move(x: number, y: number) {
      if (drag.current) drag.current = { ...drag.current, x, y }
    }
    function release() {
      drag.current = null
      canvas.style.cursor = 'grab'
    }

    canvas.addEventListener('mousedown', e => grab(e.clientX, e.clientY))
    canvas.addEventListener('mousemove', e => move(e.clientX, e.clientY))
    window.addEventListener('mouseup', release)
    canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; grab(t.clientX, t.clientY) }, { passive: false })
    canvas.addEventListener('touchmove',  e => { e.preventDefault(); const t = e.touches[0]; move(t.clientX, t.clientY) }, { passive: false })
    canvas.addEventListener('touchend', release)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mouseup', release)
    }
  }, [leave])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        opacity: fade ? 0 : 1,
        transition: 'opacity 0.7s ease-out',
        pointerEvents: fade ? 'none' : 'auto',
      }}
    >
      {/* Dark background with branding — revealed as cloth is torn */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#052e16 45%,#0f172a 100%)' }}
      >
        <div className="flex flex-col items-center gap-5 select-none">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg,#059669,#047857)',
              boxShadow: '0 0 60px rgba(5,150,105,0.6), 0 8px 32px rgba(5,150,105,0.4)',
            }}
          >
            <GraduationCap size={48} className="text-white" />
          </div>
          <div className="text-5xl font-black tracking-tight leading-none text-center">
            <span className="text-white">Ethio</span>
            <span className="text-emerald-400">School</span>
          </div>
          <p className="text-emerald-300/60 text-sm font-medium text-center">
            Find schools &amp; universities across Ethiopia
          </p>
        </div>
      </div>

      {/* Cloth canvas — pixels not covered by cloth quads are transparent */}
      <canvas
        ref={cvs}
        className="absolute inset-0"
        style={{ cursor: 'grab', touchAction: 'none' }}
      />

      {/* Grab hint — floats above cloth, disappears on first interaction */}
      {!hintGone && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ zIndex: 10001 }}
        >
          <div style={{ animation: 'grab-hint 1.8s 1.2s ease-in-out infinite' }}>
            <span className="text-3xl">✋</span>
          </div>
          <span className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
            Grab &amp; Tear to Enter
          </span>
        </div>
      )}
    </div>
  )
}
