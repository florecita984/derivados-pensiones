import { useEffect, useRef, useState } from 'react'
import { money } from '../lib/formato.js'

// Número que se anima suavemente hasta su nuevo valor (respeta "reducir movimiento").
// desde = valor inicial para contar desde ahí; esa primera cuenta espera a que el número se vea en pantalla.
export default function Num({ value, format = money, ms = 650, desde }) {
  const [shown, setShown] = useState(desde ?? value)
  const from = useRef(desde ?? value)
  const caja = useRef(null)
  const [listo, setListo] = useState(desde == null)

  useEffect(() => {
    if (listo) return
    const el = caja.current
    if (!el || typeof IntersectionObserver === 'undefined') return setListo(true)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setListo(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [listo])

  useEffect(() => {
    if (!listo) return
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
  }, [value, ms, listo])

  // La cifra que se anima es solo visual; los lectores de pantalla reciben el valor final una vez.
  return (
    <span ref={caja} className="num">
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr">{format(value)}</span>
    </span>
  )
}
