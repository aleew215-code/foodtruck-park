'use client'
/**
 * OrbParallax — mouse-reactive background orbs
 *
 * Tracks the cursor and smoothly lerps CSS custom properties
 * --orb-x / --orb-y on :root.  The background orb *wrappers*
 * in layout.tsx read these variables to shift in 3D space,
 * creating a parallax depth effect while their own CSS
 * animation still runs independently inside.
 */
import { useEffect } from 'react'

export function OrbParallax() {
  useEffect(() => {
    let rafId: number
    let targetX = 0, targetY = 0
    let currentX = 0, currentY = 0

    const onMove = (e: MouseEvent) => {
      // Map cursor to -1…+1 range, then scale to px offset
      targetX = (e.clientX / window.innerWidth  - 0.5) * 70  // ±35 px
      targetY = (e.clientY / window.innerHeight - 0.5) * 50  // ±25 px
    }

    const tick = () => {
      // Smooth lerp — feels like the orbs have inertia
      currentX += (targetX - currentX) * 0.04
      currentY += (targetY - currentY) * 0.04

      document.documentElement.style.setProperty('--orb-x',  `${currentX.toFixed(2)}px`)
      document.documentElement.style.setProperty('--orb-y',  `${currentY.toFixed(2)}px`)
      // Orb B moves in the opposite direction for extra depth
      document.documentElement.style.setProperty('--orb-x2', `${(-currentX * 1.4).toFixed(2)}px`)
      document.documentElement.style.setProperty('--orb-y2', `${(-currentY * 1.4).toFixed(2)}px`)

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
