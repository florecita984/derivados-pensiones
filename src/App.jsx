import { useCallback, useEffect, useMemo, useState } from 'react'
import { LazyMotion, MotionConfig } from 'motion/react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import MiPension from './components/MiPension.jsx'
import Capitulos from './components/Capitulos.jsx'
import Modalidad40 from './components/Modalidad40.jsx'
import Ahorrar from './components/Ahorrar.jsx'
import Aviso from './components/Aviso.jsx'
import Cierre from './components/Cierre.jsx'
import { calcPension, retiroMinimo } from './lib/pension.js'
import { calcM40 } from './lib/m40.js'
import { calcAhorro, compararConLeyes } from './lib/ahorro.js'

// Valores iniciales: los mismos de la calculadora de referencia.
const CASO = { edad: 30, sbc: 20000, ini: 2018, ret: 65, aho: 0, esp: false, hij: 0, pad: 0 }
const M40 = { ur: 5000, sem: 1000, m: 5 }
const PLAN = { s0: 0, sm: 1500, rt: 5, ys: 40, inf: 4, goal: 3000000 }

// Las funciones de animación se descargan aparte: la página se pinta sin esperarlas.
const funcionesMotion = () => import('./funciones-motion.js').then((r) => r.default)

// Enlaces de la versión anterior (#/simulador, ...) a la sección equivalente de la landing.
const RUTAS_VIEJAS = { simulador: 'mi-pension', ahorra: 'ahorrar', aprende: 'como-funciona' }

export default function App() {
  const [caso, setCaso] = useState(CASO)
  const [x11, setX11] = useState(false)
  const [m40, setM40] = useState(M40)
  const [plan, setPlan] = useState(PLAN)

  // La edad de retiro siempre va después de la edad actual, como en la referencia.
  const setC = useCallback(
    (k) => (v) =>
      setCaso((p) => {
        const n = { ...p, [k]: v }
        if (k === 'edad') n.ret = Math.max(n.ret, retiroMinimo(v))
        return n
      }),
    [],
  )
  const setM = useCallback((k) => (v) => setM40((p) => ({ ...p, [k]: v })), [])
  const setP = useCallback((k) => (v) => setPlan((p) => ({ ...p, [k]: v })), [])

  const r = useMemo(() => calcPension(caso, x11), [caso, x11])
  const res40 = useMemo(() => calcM40(m40), [m40])
  const h = useMemo(() => calcAhorro(plan), [plan])
  const k = useMemo(() => compararConLeyes(r, h), [r, h])

  const irA = useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', id === 'inicio' ? window.location.pathname : '#' + id)
  }, [])

  useEffect(() => {
    const id = window.location.hash.replace(/^#\/?/, '')
    const el = document.getElementById(RUTAS_VIEJAS[id] || id)
    if (el) requestAnimationFrame(() => el.scrollIntoView())
  }, [])

  return (
    <LazyMotion features={funcionesMotion} strict>
    <MotionConfig reducedMotion="user">
      <a className="saltar" href="#mi-pension">Saltar a la calculadora</a>
      <Nav irA={irA} />
      <main>
        <Hero caso={caso} set={setC} r={r} irA={irA} />
        <MiPension caso={caso} set={setC} x11={x11} setX11={setX11} r={r} />
        <Capitulos r={r} h={h} />
        <Modalidad40 m40={m40} set={setM} res={res40} />
        <Ahorrar plan={plan} set={setP} h={h} k={k} r={r} irA={irA} />
        <Aviso />
      </main>
      <Cierre irA={irA} />
    </MotionConfig>
    </LazyMotion>
  )
}
