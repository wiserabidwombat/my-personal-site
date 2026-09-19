import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from '@tanstack/react-router'

export function PageTransition() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -16 },
      }

  const transition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.25, ease: 'easeInOut' as const }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        data-page-transition
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={transition}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
