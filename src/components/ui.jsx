import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { money } from '../lib/calc.js'

// Aparición suave al entrar en pantalla. Si el navegador no lo soporta, el contenido se muestra directamente.
export function Reveal({ as: Tag = 'div', className = '', children, ...resto }) {
  const ref = useRef(null)
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisto(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true)
          io.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    const seguro = setTimeout(() => setVisto(true), 2500)
    return () => {
      io.disconnect()
      clearTimeout(seguro)
    }
  }, [])

  return (
    <Tag ref={ref} className={'reveal ' + (visto ? 'in ' : '') + className} {...resto}>
      {children}
    </Tag>
  )
}

// Etiqueta pequeña sobre los títulos.
export function Chip({ children, tone = 'blue' }) {
  return <span className={'chip chip-' + tone}>{children}</span>
}

// Encabezado de página: etiqueta, título y una línea opcional.
export function PageHead({ chip, title, children }) {
  return (
    <header className="ph">
      {chip && <Chip>{chip}</Chip>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  )
}

// Diferencia entre ambas pensiones (valores derivados de los resultados ya calculados).
export function DiffPill({ cmp }) {
  const { mayor, diff, veces } = cmp
  return (
    <div className="diffp">
      <span className="diffp-i"><Icon name="trend" size={20} /></span>
      <p>
        La <b>Ley {mayor}</b> paga <b className="pos">{money(diff)} más</b> al mes
      </p>
      {veces != null && <span className="diffp-x">{veces.toFixed(1)}×</span>}
    </div>
  )
}

// Aviso compacto (solo para advertencias que el usuario debe ver).
export function Alerta({ children }) {
  return (
    <div className="alerta" role="alert">
      <Icon name="alert" size={20} />
      <p>{children}</p>
    </div>
  )
}
