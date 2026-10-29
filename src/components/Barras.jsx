import { m } from 'motion/react'
import { money } from '../lib/formato.js'

const RESORTE = { type: 'spring', stiffness: 200, damping: 30 }

// Montos mensuales comparados en barras horizontales, cada una con su valor al final.
// fila = { id, nombre, valor, partes: [[clase, valor], ...], sub? }; varias partes se apilan.
export default function Barras({ filas, etiqueta }) {
  const max = Math.max(...filas.map((f) => f.valor), 1)
  return (
    <ul className="barras" aria-label={etiqueta}>
      {filas.map((f) => (
        <li key={f.id} className="barra">
          <div className="barra-cab">
            <span className="barra-nombre">
              {f.partes.map(([clase]) => <i key={clase} className={'clave clave-' + clase} />)}
              {f.nombre}
            </span>
            <b>{money(f.valor)}<small> al mes</small></b>
          </div>
          <div className="barra-pista" aria-hidden="true">
            {f.partes.map(([clase, v]) => (
              <m.span
                key={clase}
                className={'barra-seg seg-' + clase}
                initial={false}
                animate={{ width: (v / max) * 100 + '%' }}
                transition={RESORTE}
              />
            ))}
          </div>
          {f.sub && <p className="barra-sub">{f.sub}</p>}
        </li>
      ))}
    </ul>
  )
}
