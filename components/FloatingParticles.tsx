'use client'
/**
 * FloatingParticles — Google Antigravity style
 *
 * Food emojis float UPWARD from the bottom of the screen,
 * as if gravity is reversed. Pure CSS keyframe animation,
 * randomized per particle (position, size, speed, delay, opacity).
 * Purely decorative — pointer-events none, aria-hidden.
 */
import { useEffect, useState } from 'react'

const EMOJIS = ['🌮', '🍔', '🌯', '🍕', '🥙', '🍜', '🥗', '🌭', '🍟', '🫔', '🍱', '🧆', '🥤', '🍦', '🫙']

interface Particle {
  id: number
  emoji: string
  x: number        // % from left edge
  size: number     // font-size px
  duration: number // total rise time in seconds
  delay: number    // negative = already mid-air at load
  opacity: number
  spin: number     // slight rotation during rise
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate only on client to avoid hydration mismatch
    const list: Particle[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      x: 2 + (i * 4.3 + Math.sin(i * 1.7) * 12) % 96, // spread across width
      size: 18 + (i * 7) % 26,                          // 18–44 px
      duration: 20 + (i * 3.1) % 22,                    // 20–42 s
      delay: -((i * 3.7) % 35),                         // already in-flight
      opacity: 0.055 + (i * 0.007) % 0.09,              // 5.5–14.5%
      spin: (i % 2 === 0 ? 1 : -1) * (8 + (i * 2) % 18), // ±8–26 deg
    }))
    setParticles(list)
  }, [])

  return (
    <>
      <style>{`
        @keyframes ag-rise {
          0%   { transform: translateY(110vh) rotate(0deg)   scale(1);    opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateY(-120px) rotate(var(--spin)) scale(0.85); opacity: 0; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              bottom: 0,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              lineHeight: 1,
              userSelect: 'none',
              willChange: 'transform',
              /* CSS variable so the keyframe can reference the spin amount */
              '--spin': `${p.spin}deg`,
              animation: `ag-rise ${p.duration}s linear ${p.delay}s infinite`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        ))}
      </div>
    </>
  )
}
