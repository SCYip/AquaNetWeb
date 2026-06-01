import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap'

/* ────────────────────────────────────────────────────────────────────────────
 * MotionProvider — AquaNet 水眸 · Instrument Console motion layer
 *
 * Logic-only (renders no wrapper of its own). Uses native scrolling — no
 * ScrollSmoother — so every page, including the Leaflet /map page, scrolls
 * normally. On each route it resets scroll to the top and stages the
 * sections/tiles marked `.reveal` (fade-rise on scroll via GSAP ScrollTrigger).
 *
 * Gated behind prefers-reduced-motion: no-preference — reduced-motion users get
 * a static, fully-visible page (nothing is ever hidden).
 * ──────────────────────────────────────────────────────────────────────────── */

export function MotionProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  useGSAP(
    () => {
      window.scrollTo(0, 0)

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.reveal')
        items.forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
        ScrollTrigger.refresh()
      })
      return () => mm.revert()
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )

  return <>{children}</>
}
