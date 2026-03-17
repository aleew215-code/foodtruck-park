'use client'
/**
 * TiltCard — Google Anti-Gravity style
 *
 * Wraps any content in a div that:
 *  • Tilts in 3D toward the cursor (zero-gravity feel)
 *  • Shows a dynamic light-shine that follows the mouse
 *  • Snaps back smoothly when cursor leaves
 *
 * Zero external dependencies — pure React + CSS.
 */
import { useRef, useCallback, ReactNode, CSSProperties } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** 0–1. How strong the tilt is. Default 0.6 */
  intensity?: number
  /** Extra Z lift on hover in px. Default 20 */
  lift?: number
}

export function TiltCard({
  children,
  className = '',
  style,
  intensity = 0.6,
  lift = 20,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const raf = useRef<number>(0)

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        const el = ref.current
        const shine = shineRef.current
        if (!el || !shine) return

        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width   // 0 → 1
        const y = (e.clientY - r.top)  / r.height  // 0 → 1

        const tiltX = (y - 0.5) * -22 * intensity
        const tiltY = (x - 0.5) *  22 * intensity

        el.style.transform =
          `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${lift}px)`

        // Shine radial gradient follows cursor
        shine.style.background =
          `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.13) 0%, transparent 55%)`
        shine.style.opacity = '1'
      })
    },
    [intensity, lift],
  )

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current)
    const el = ref.current
    const shine = shineRef.current
    if (!el || !shine) return
    el.style.transform =
      'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
    shine.style.opacity = '0'
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        position: 'relative',
        transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Dynamic light-shine overlay */}
      <div
        ref={shineRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 20,
          opacity: 0,
          transition: 'opacity 0.25s ease',
        }}
      />
      {children}
    </div>
  )
}
