'use client'
import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'

const ETHIO  = ['E', 't', 'h', 'i', 'o']
const SCHOOL = ['S', 'c', 'h', 'o', 'o', 'l']
const LETTER_DELAY_MS = 55   // stagger between letters
const VISIBLE_MS = 2700      // how long the loader stays on screen

export default function PageLoader() {
  const [phase, setPhase] = useState<'show' | 'exit' | 'gone'>('show')

  useEffect(() => {
    // Only show once per browser session
    if (typeof window !== 'undefined' && sessionStorage.getItem('ethio_loaded')) {
      setPhase('gone')
      return
    }

    const exitTimer = setTimeout(() => {
      setPhase('exit')
      sessionStorage.setItem('ethio_loaded', '1')
    }, VISIBLE_MS)

    const goneTimer = setTimeout(() => {
      setPhase('gone')
    }, VISIBLE_MS + 750)

    return () => { clearTimeout(exitTimer); clearTimeout(goneTimer) }
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #052e16 45%, #0f172a 100%)',
        animation: phase === 'exit' ? 'loader-exit 0.75s cubic-bezier(0.4,0,0.2,1) forwards' : 'loader-bg-in 0.3s ease-out forwards',
        pointerEvents: phase === 'exit' ? 'none' : 'auto',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow at center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16,185,129,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Ethiopian flag stripe — animated in */}
      <div className="absolute top-0 left-0 right-0 flex h-1.5 overflow-hidden">
        {[
          { color: '#078930', delay: '0ms' },
          { color: '#FCDD09', delay: '80ms' },
          { color: '#DA121A', delay: '160ms' },
        ].map(({ color, delay }) => (
          <div
            key={color}
            className="flex-1 origin-left"
            style={{
              backgroundColor: color,
              animation: `loader-flag-in 0.5s ${delay} cubic-bezier(0.22,1,0.36,1) both`,
            }}
          />
        ))}
      </div>

      {/* Main centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">

        {/* Logo icon with glow */}
        <div
          className="relative mb-8"
          style={{ animation: 'loader-icon 0.9s 0.15s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Outer glow ring */}
          <div
            className="absolute -inset-4 rounded-full"
            style={{ animation: 'loader-glow 2.5s 1s ease-in-out infinite' }}
          />
          {/* Ring */}
          <div className="absolute -inset-2 rounded-full border-2 border-emerald-500/30" />

          {/* Icon box */}
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 8px 32px rgba(5,150,105,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <GraduationCap size={40} className="text-white drop-shadow-sm" />
          </div>
        </div>

        {/* Brand name — letter by letter */}
        <div
          className="flex items-baseline overflow-hidden mb-3"
          aria-label="EthioSchool"
        >
          {/* "Ethio" — white */}
          {ETHIO.map((letter, i) => (
            <span
              key={`e${i}`}
              className="text-white font-extrabold"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                display: 'inline-block',
                animation: `loader-letter 0.45s ${200 + i * LETTER_DELAY_MS}ms cubic-bezier(0.22,1,0.36,1) both`,
              }}
            >
              {letter}
            </span>
          ))}

          {/* "School" — emerald */}
          {SCHOOL.map((letter, i) => (
            <span
              key={`s${i}`}
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                display: 'inline-block',
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
                animation: `loader-letter 0.45s ${200 + (ETHIO.length + i) * LETTER_DELAY_MS}ms cubic-bezier(0.22,1,0.36,1) both`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="text-slate-400 text-sm sm:text-base font-medium tracking-wide mb-10 text-center"
          style={{
            animation: 'loader-tagline 0.6s 900ms ease-out both',
          }}
        >
          Find schools &amp; universities across Ethiopia
        </p>

        {/* Progress bar */}
        <div
          className="w-64 sm:w-80 space-y-2"
          style={{ animation: 'loader-tagline 0.5s 950ms ease-out both' }}
        >
          <div className="h-[3px] bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #059669, #34d399, #059669)',
                backgroundSize: '200% 100%',
                animation: `loader-bar ${VISIBLE_MS - 200}ms 600ms cubic-bezier(0.4,0,0.2,1) forwards, loader-bar-glow 1.5s ease-in-out infinite`,
              }}
            />
          </div>
          <p
            className="text-center text-slate-500 text-xs"
            style={{ animation: 'loader-tagline 0.4s 1100ms ease-out both' }}
          >
            Powered by EthioSchool &mdash; Free education search
          </p>
        </div>
      </div>

      {/* Bottom decorative dots — Ethiopian flag colors */}
      <div
        className="flex justify-center gap-2 pb-8"
        style={{ animation: 'loader-tagline 0.5s 1000ms ease-out both' }}
      >
        {[
          { color: '#078930', delay: '0ms' },
          { color: '#FCDD09', delay: '150ms' },
          { color: '#DA121A', delay: '300ms' },
        ].map(({ color, delay }, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full"
            style={{
              backgroundColor: color,
              height: '24px',
              animation: `loader-dot 1.2s ${delay} ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
