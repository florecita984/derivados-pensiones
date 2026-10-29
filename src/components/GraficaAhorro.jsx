import { useRef, useState } from 'react'
import { money, moneyCorto } from '../lib/formato.js'
import { escala } from '../lib/escala.js'
import { useAncho } from './ui.jsx'

// Columna con solo las esquinas de arriba redondeadas (la base queda recta sobre el eje).
function columna(x, arriba, abajo, w, r) {
  const rr = Math.max(0, Math.min(r, w / 2, abajo - arriba))
  return `M${x},${abajo} V${arriba + rr} Q${x},${arriba} ${x + rr},${arriba} H${x + w - rr} Q${x + w},${arriba} ${x + w},${arriba + rr} V${abajo} Z`
}

// Ahorro acumulado año por año: lo que pones tú abajo y lo que ganan los intereses arriba.
export default function GraficaAhorro({ porAnio }) {
  const caja = useRef(null)
  const [W, estable] = useAncho(caja, 720)
  const [hover, setHover] = useState(null)
  const n = porAnio.length
  const angosto = W < 520
  const H = angosto ? 250 : 300
  const pl = angosto ? 58 : 68
  const pr = 8
  const pt = 30
  const base = H - 36
  const banda = (W - pl - pr) / n
  const bw = Math.min(24, Math.max(1, banda - 2)) // 2px de aire entre columnas vecinas
  const { max: mx, ticks } = escala(Math.max(...porAnio.map((a) => a.total), 1), 4)
  const y = (v) => base - ((base - pt) * v) / mx
  const x = (i) => pl + banda * i + (banda - bw) / 2
  const cada = [1, 2, 5, 10, 20].find((p) => n / p <= (angosto ? 5 : 10)) || 20
  const ultimo = porAnio[n - 1]
  const act = hover != null ? porAnio[hover] : null
  const tipIzq = hover != null && x(hover) > W * 0.6

  return (
    <div className={'gr' + (estable ? ' estable' : '')} ref={caja}>
      <div className="leyenda" aria-hidden="true">
        <span><i className="sw sw-gris" />Lo que pones tú</span>
        <span><i className="sw sw-verde" />Intereses que gana</span>
      </div>

      <div className="gr-plot">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ahorro acumulado año por año: lo que pones tú y los intereses que gana">
          {ticks.map((v, i) => (
            <g key={v}>
              <line className={i === 0 ? 'gr-base' : 'gr-rejilla'} x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} />
              <text className="gr-eje" x={pl - 10} y={y(v) + 4} textAnchor="end">{moneyCorto(v)}</text>
            </g>
          ))}

          {porAnio.map((a, i) => {
            const yA = y(a.aportado)
            const yT = y(a.total)
            const conIntereses = yA - yT > 2.5
            const tenue = hover != null && hover !== i ? ' tenue' : ''
            return (
              <g key={a.anio}>
                <path className={'gr-seg seg-gris' + tenue} d={conIntereses ? `M${x(i)},${base} V${yA} H${x(i) + bw} V${base} Z` : columna(x(i), yA, base, bw, 4)} />
                {conIntereses && <path className={'gr-seg seg-verde' + tenue} d={columna(x(i), yT, yA - 2, bw, 4)} />}
              </g>
            )
          })}

          {/* Única etiqueta directa: el total al final */}
          <text className="gr-final" x={Math.min(x(n - 1) + bw / 2, W - pr)} y={y(ultimo.total) - 10} textAnchor={n > 1 ? 'end' : 'middle'}>
            {money(ultimo.total)}
          </text>

          {porAnio.map((a, i) =>
            a.anio === 1 || a.anio % cada === 0 || i === n - 1 ? (
              <text key={'x' + a.anio} className="gr-x" x={x(i) + bw / 2} y={H - 12} textAnchor="middle">
                {a.anio === 1 ? 'Año 1' : a.anio}
              </text>
            ) : null,
          )}

          {porAnio.map((a, i) => (
            <rect
              key={'z' + a.anio}
              className="gr-zona"
              x={pl + banda * i}
              y="0"
              width={banda}
              height={H}
              tabIndex={i === 0 || i === n - 1 || a.anio % cada === 0 ? 0 : -1}
              role="img"
              aria-label={`Año ${a.anio}: ${money(a.total)} en total, ${money(a.aportado)} que pusiste y ${money(a.intereses)} de intereses.`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            />
          ))}
        </svg>

        {act && (
          <div className={'tip' + (tipIzq ? ' izq' : '')} style={{ left: x(hover) + bw / 2 }} role="presentation">
            <b>Año {act.anio}</b>
            <span><em>{money(act.total)}</em>en total</span>
            <span><i className="tecla tecla-gris" /><em>{money(act.aportado)}</em>lo que pones tú</span>
            <span><i className="tecla tecla-verde" /><em>{money(act.intereses)}</em>intereses</span>
          </div>
        )}
      </div>
    </div>
  )
}
