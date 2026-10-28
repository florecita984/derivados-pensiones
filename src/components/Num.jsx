import { useEffect, useRef, useState } from 'react'
import { money } from '../lib/calc.js'

// Número que se anima suavemente hasta su nuevo valor (respeta "reducir movimiento").
export default function Num({ value, format = money, ms = 600 }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || from.current === value) {
      from.current = value
      setShown(value)
      return
    }
    const a = from.current
    const t0 = performance.now()
    let raf
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / ms)
      const e = 1 - Math.pow(1 - k, 3)
      const v = a + (value - a) * e
      from.current = v
      setShown(v)
      if (k < 1) raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])

  return <>{format(shown)}</>
}
