'use client'
import { useEffect, useState } from 'react'

const LINE1 = 'Welcome To'
const LINE2 = 'MyFood App'

// Only show once per browser session
const STORAGE_KEY = 'myfood_splash_seen'

export function SplashScreen() {
  const [phase, setPhase] = useState<'gather' | 'hold' | 'exit' | 'done'>('gather')

  useEffect(() => {
    // Skip if already seen in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY)) {
      setPhase('done')
      return
    }

    // Phase timeline:
    // 0ms       → letters start spread (CSS initial state)
    // 0–1000ms  → letters gather to center (CSS transition)
    // 1000ms    → hold
    // 3500ms    → exit fade + scale
    // 5000ms    → unmount

    const t1 = setTimeout(() => setPhase('hold'),  1000)
    const t2 = setTimeout(() => setPhase('exit'),  3500)
    const t3 = setTimeout(() => {
      setPhase('done')
      sessionStorage.setItem(STORAGE_KEY, '1')
    }, 5000)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (phase === 'done') return null

  const isExit    = phase === 'exit'
  const isGather  = phase === 'gather'

  return (
    <div
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        background:      '#06040200',
        overflow:        'hidden',
        // Exit: fade + slight scale-down
        opacity:          isExit ? 0 : 1,
        transform:        isExit ? 'scale(1.04)' : 'scale(1)',
        transition:       isExit ? 'opacity 1.4s cubic-bezier(0.4,0,1,1), transform 1.4s cubic-bezier(0.4,0,1,1)' : 'none',
        pointerEvents:    isExit ? 'none' : 'all',
      }}
    >
      {/* Deep dark background */}
      <div style={{ position: 'absolute', inset: 0, background: '#080503' }} />

      {/* Animated orb — orange center glow */}
      <div
        style={{
          position:     'absolute',
          width:        '600px',
          height:       '600px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(249,115,22,0.28) 0%, rgba(249,115,22,0.08) 45%, transparent 70%)',
          animation:    'ag-orb-a 8s ease-in-out infinite',
          top:          '50%',
          left:         '50%',
          transform:    'translate(-50%, -50%)',
        }}
      />

      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, transparent 0%, black 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 0%, black 80%)',
        }}
      />

      {/* Text content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', userSelect: 'none' }}>

        {/* "Welcome To" */}
        <div
          style={{
            fontSize:      'clamp(28px, 7vw, 72px)',
            fontWeight:    300,
            letterSpacing: isGather ? '0.55em' : '0.06em',
            color:         'rgba(255,255,255,0.75)',
            transition:    'letter-spacing 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease',
            opacity:       isGather ? 0 : 1,
            fontFamily:    'Inter, system-ui, sans-serif',
            lineHeight:    1.1,
            marginBottom:  '4px',
          }}
        >
          {LINE1}
        </div>

        {/* "MyFood App" — bold, gradient */}
        <div
          style={{
            fontSize:       'clamp(42px, 12vw, 120px)',
            fontWeight:     900,
            letterSpacing:  isGather ? '0.30em' : '-0.02em',
            background:     'linear-gradient(120deg, #f97316 0%, #fbbf24 40%, #fb923c 75%, #f97316 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip: 'text',
            animation:      'ag-shimmer 3s linear infinite',
            transition:     'letter-spacing 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease',
            opacity:        isGather ? 0 : 1,
            fontFamily:     'Inter, system-ui, sans-serif',
            lineHeight:     1,
            // drop shadow for depth (on wrapper)
            filter:         'drop-shadow(0 0 40px rgba(249,115,22,0.40)) drop-shadow(0 4px 24px rgba(0,0,0,0.60))',
          }}
        >
          {LINE2}
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop:  '24px',
            fontSize:   'clamp(12px, 2vw, 16px)',
            fontWeight: 400,
            color:      'rgba(255,255,255,0.28)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, system-ui, sans-serif',
            opacity:    phase === 'hold' ? 1 : 0,
            transition: 'opacity 0.8s ease 0.4s',
          }}
        >
          Order · Discover · Enjoy
        </div>

        {/* Thin animated line under logo */}
        <div
          style={{
            margin:       '20px auto 0',
            height:       '2px',
            borderRadius: '2px',
            background:   'linear-gradient(90deg, transparent, #f97316, #fbbf24, #f97316, transparent)',
            width:        phase === 'hold' ? '260px' : '0px',
            transition:   'width 1s cubic-bezier(0.16,1,0.3,1) 0.3s',
            boxShadow:    '0 0 12px rgba(249,115,22,0.60)',
          }}
        />
      </div>
    </div>
  )
}
