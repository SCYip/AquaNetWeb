/* ────────────────────────────────────────────────────────────────────────────
 * GSAP setup — AquaNet 水眸
 *
 * Registers GSAP + plugins exactly once (ES modules are singletons, so importing
 * from here anywhere guarantees a single registration). Import gsap / useGSAP /
 * ScrollTrigger / ScrollSmoother / SplitText from this module, never directly.
 * ──────────────────────────────────────────────────────────────────────────── */

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

// Mechanical, instrument-like default — confident, no bounce.
gsap.defaults({ ease: 'power3.out', duration: 0.8 })

export { gsap, useGSAP, ScrollTrigger, SplitText }
