import { Fragment } from 'react'
import Icon from './Icon.jsx'

// Efectos de movimiento ligeros (inspirados en React Bits), sin dependencias externas.

// Título que entra palabra por palabra. hl = palabras que se resaltan con el color de marca.
export function SplitText({ text, hl = [] }) {
  return (
    <span className="split" aria-label={text}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          <span className="split-w" aria-hidden="true">
            <span className={'split-i' + (hl.includes(w) ? ' hl' : '')} style={{ animationDelay: 0.08 * i + 0.1 + 's' }}>
              {w}
            </span>
          </span>{' '}
        </Fragment>
      ))}
    </span>
  )
}

// Cinta de datos que se desplaza sin parar. Se pausa al pasar el cursor y con "reducir movimiento".
export function Marquee({ items }) {
  const fila = [...items, ...items]
  return (
    <div className="marquee" role="region" aria-label="Datos clave">
      <div className="marquee-track">
        {fila.map((t, i) => (
          <span className="marquee-i" key={i} aria-hidden={i >= items.length ? 'true' : undefined}>
            <Icon name="spark" size={16} strokeWidth={2.2} />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
