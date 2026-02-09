import { useEffect, useRef } from 'react'
import { useSpring, useTransform, motion, useInView } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, format: formatFn, duration = 0.8, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })

  const display = useTransform(spring, (current) => {
    return formatFn ? formatFn(Math.round(current)) : Math.round(current).toLocaleString('fr-FR')
  })

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, value, spring])

  return <motion.span ref={ref} className={className}>{display}</motion.span>
}
