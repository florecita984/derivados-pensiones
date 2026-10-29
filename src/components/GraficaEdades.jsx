import { useRef, useState } from 'react'
import { m } from 'motion/react'
import { money, moneyCorto } from '../lib/formato.js'
import { escala } from '../lib/escala.js'
import { useAncho } from './ui.jsx'

const RESORTE = { type: 'spring', stiffness: 260, damping: 30 }

// Pensión mensual por edad de retiro: una columna por ley en cada edad, la edad elegida resaltada.
// Pasar el cursor (o enfocar con el teclado) muestra los dos montos; tocar una edad la elige.
export default function GraficaEdades({ filas, ret, onRet }) {
  const caja = useRef(null)
  const [W, estable] = useAncho(caja, 720)
  const [hover, setHover] = useState(null)
  const n = filas.length
  const angosto = W < 520
  const H = angosto ? 250 : 300
  const pl = angosto ? 54 : 64
  const pr = 6
  const pt = 16
  const base = H - 36
  const banda = (W - pl - pr) / n
  const bw = Math.min(24, Math.max(4, (banda - 10) / 2)) // columnas de máximo 24px; el resto de la banda es aire
  const { max: mx, ticks } = escala(Math.max(...filas.map((f) => Math.max(f[1], f[2]))), 4)
  const y = (v) => base - ((base - pt) * v) / mx
  const cx = (i) => pl + banda * i + banda / 2
  const iSel = filas.findIndex((f) => f[0] === ret)
  const cada = angosto && n > 9 ? 2 : 1
  const t = estable ? RESORTE : { duration: 0 }

  const elegir = (i) => onRet(filas[i][0])
  const tip = hover != null ? filas[hover] : null
  const tipIzq = hover != null && cx(hover) > W * 0.62

  return (
    <div className="gr" ref={caja}>
      <div className="leyenda" aria-hidden="true">
        <span><i className="sw sw-73" />Ley 73</span>
        <span><i className="sw sw-97" />Ley 97</span>
        <span><i className="sw sw-sel" />Edad que elegiste</span>
      </div>

      <div className="gr-plot">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pensión mensual por edad de retiro con la Ley 73 y la Ley 97">
          <defs>
            <clipPath id="gr-edades-base">
              <rect x="0" y="0" width={W} height={base} />
            </clipPath>
          </defs>

          {iSel >= 0 && (
            <m.rect
              className="gr-sel"
              initial={false}
              animate={{ x: pl + banda * iSel + 2 }}
              transition={t}
              y={pt - 10}
              width={banda - 4}
              height={H - pt + 8}
              rx="10"
            />
          )}

          {ticks.map((v, i) => (
            <g key={v}>
              <line className={i === 0 ? 'gr-base' : 'gr-rejilla'} x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} />
              <text className="gr-eje" x={pl - 10} y={y(v) + 4} textAnchor="end">{moneyCorto(v)}</text>
            </g>
          ))}

          {/* Columnas: el redondeo de abajo queda bajo la línea base y se recorta, así la base es recta. */}
          <g clipPath="url(#gr-edades-base)">
            {filas.map((f, i) =>
              [1, 2].map((k) => (
                <m.rect
                  key={f[0] + '-' + k}
                  className={'gr-col gr-col-' + (k === 1 ? '73' : '97') + (hover != null && hover !== i ? ' tenue' : '')}
                  x={cx(i) + (k === 1 ? -bw - 1 : 1)}
                  width={bw}
                  rx={Math.min(4, bw / 2)}
                  initial={false}
                  animate={{ y: y(f[k]), height: base - y(f[k]) + 6 }}
                  transition={t}
                />
              )),
            )}
          </g>

          {/* En pantallas angostas va una etiqueta sí y una no; la edad elegida siempre, sin vecinas que la tapen. */}
          {filas.map((f, i) =>
            i === iSel || (i % cada === 0 && (iSel < 0 || Math.abs(i - iSel) >= cada)) ? (
              <text key={'x' + f[0]} className={'gr-x' + (i === iSel ? ' sel' : '')} x={cx(i)} y={H - 12} textAnchor="middle">
                {f[0]}
              </text>
            ) : null,
          )}

          {filas.map((f, i) => (
            <rect
              key={'z' + f[0]}
              className="gr-zona"
              x={pl + banda * i}
              y="0"
              width={banda}
              height={H}
              tabIndex={0}
              role="button"
              aria-pressed={i === iSel}
              aria-label={`Retiro a los ${f[0]} años: Ley 73 ${money(f[1])}, Ley 97 ${money(f[2])} al mes. Elegir esta edad.`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => elegir(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  elegir(i)
                }
              }}
            />
          ))}
        </svg>

        {tip && (
          <div className={'tip' + (tipIzq ? ' izq' : '')} style={{ left: cx(hover) }} role="presentation">
            <b>Retiro a los {tip[0]} años</b>
            <span><i className="tecla tecla-73" /><em>{money(tip[1])}</em>Ley 73</span>
            <span><i className="tecla tecla-97" /><em>{money(tip[2])}</em>Ley 97</span>
            {hover !== iSel && <small>Toca para elegir esta edad</small>}
          </div>
        )}
      </div>
    </div>
  )
}
