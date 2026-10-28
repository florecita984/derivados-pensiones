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

// Piezas de interfaz reutilizables para mantener una identidad visual consistente.

export function Eyebrow({ children }) {
  return <span className="eyebrow">{children}</span>
}

export function SectionHeader({ eyebrow, title, children }) {
  return (
    <div className="sec-head">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="page-head">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  )
}

const ICONO_TONO = { info: 'info', warn: 'alert', gold: 'info', ok: 'check' }

// Aviso destacado: tonos info, warn, gold (nota de estimación) y ok.
export function Callout({ tone = 'info', title, children }) {
  return (
    <div className={'callout callout-' + tone} role={tone === 'warn' ? 'alert' : 'note'}>
      <Icon name={ICONO_TONO[tone]} size={20} className="callout-i" />
      <div>
        {title && <strong>{title}</strong>}
        <p>{children}</p>
      </div>
    </div>
  )
}

// Insignia pequeña de régimen: "Ley 73" / "Ley 97".
export function LeyBadge({ ley }) {
  return <span className={'ley-badge ley-' + ley}>Ley {ley}</span>
}

// Diferencia entre ambas pensiones (valores derivados de los resultados ya calculados).
export function DiffStrip({ cmp }) {
  const { mayor, diff, pct, veces } = cmp
  return (
    <div className="diff">
      <span className="diff-i"><Icon name="trend" size={20} /></span>
      <div className="diff-t">
        <b>La Ley {mayor} paga más</b>
        <small>Diferencia mensual estimada entre ambas pensiones</small>
      </div>
      <div className="diff-v">
        <span className="delta delta-pos"><Icon name="up" size={14} strokeWidth={2.4} />{money(diff)} al mes</span>
        {veces != null && <span className="delta delta-neutral">{veces.toFixed(1)} veces</span>}
        {pct != null && <span className="delta delta-neutral">+{Math.round(pct)}%</span>}
      </div>
    </div>
  )
}
