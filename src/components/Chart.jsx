import { useState } from 'react'
import { money } from '../lib/calc.js'
import { comparar } from '../lib/comparar.js'
import { area, curva } from '../lib/trazo.js'

// Gráfica de líneas: pensión mensual por edad de retiro, con lectura interactiva.
export default function Chart({ rows, retiro }) {
  const idxRetiro = Math.max(0, rows.findIndex((r) => r[0] === retiro))
  const [hover, setHover] = useState(null)
  const act = Math.min(hover ?? idxRetiro, rows.length - 1)

  const n = rows.length
  const mx = Math.max(...rows.map((r) => Math.max(r[1], r[2]))) * 1.12
  const W = 560
  const H = 290
  const pl = 48
  const pr = 28
  const pt = 22
  const pb = 40
  const iw = W - pl - pr
  const base = pt + (H - pt - pb)
  const ih = base - pt
  const x = (i) => (n === 1 ? pl + iw / 2 : pl + (iw * i) / (n - 1))
  const y = (v) => base - (ih * v) / mx
  const ticks = [0, 1, 2, 3, 4].map((i) => (mx * i) / 4)

  const p73 = rows.map((r, i) => [x(i), y(r[1])])
  const p97 = rows.map((r, i) => [x(i), y(r[2])])
  const [edad, v73, v97] = rows[act]
  const cmp = comparar(v73, v97)
  const col = n === 1 ? iw : iw / (n - 1)

  return (
    <div className="chart">
      <div className="legend">
        <span><i style={{ background: 'var(--l73)' }} />Ley 73</span>
        <span><i style={{ background: 'var(--l97)' }} />Ley 97</span>
        <span className="legend-sel"><i className="sel" />Tu edad de retiro</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Pensión mensual estimada por edad de retiro">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 5'} />
            <text x={pl - 10} y={y(t) + 3.5} fontSize="10.5" textAnchor="end" fill="var(--mu)">
              {Math.round(t / 1000)}k
            </text>
          </g>
        ))}

        {/* Guía vertical de la edad activa */}
        <line x1={x(act)} x2={x(act)} y1={pt - 6} y2={base} stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="4 4" opacity=".55" />

        <path d={area(p73, base)} fill="var(--l73)" opacity=".08" />
        <path d={area(p97, base)} fill="var(--l97)" opacity=".1" />
        <path className="draw" pathLength="1" d={curva(p73)} fill="none" stroke="var(--l73)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw" pathLength="1" d={curva(p97)} fill="none" stroke="var(--l97)" strokeWidth="3" strokeLinecap="round" />

        {rows.map((r, i) => {
          const on = i === act
          return (
            <g key={r[0]}>
              <circle cx={x(i)} cy={y(r[1])} r={on ? 6.5 : 4} fill="#fff" stroke="var(--l73)" strokeWidth="2.5" style={{ transition: 'r .15s' }} />
              <circle cx={x(i)} cy={y(r[2])} r={on ? 6.5 : 4} fill="#fff" stroke="var(--l97)" strokeWidth="2.5" style={{ transition: 'r .15s' }} />
              {i === idxRetiro && <rect x={x(i) - 15} y={H - 31} width="30" height="22" rx="7" fill="var(--brand)" />}
              <text
                x={x(i)}
                y={H - 15.5}
                fontSize="12.5"
                textAnchor="middle"
                fill={i === idxRetiro ? '#fff' : on ? 'var(--ink)' : 'var(--mu)'}
                fontWeight={on || i === idxRetiro ? 700 : 500}
              >
                {r[0]}
              </text>
            </g>
          )
        })}

        {/* Zonas interactivas */}
        {rows.map((r, i) => (
          <rect
            key={'z' + r[0]}
            x={x(i) - col / 2}
            y={pt - 8}
            width={col}
            height={H - pt}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`Retiro a los ${r[0]} años: Ley 73 ${money(r[1])}, Ley 97 ${money(r[2])}`}
            style={{ cursor: 'pointer', outline: 'none' }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => setHover(i)}
          />
        ))}
      </svg>

      <div className="readout" aria-live="polite">
        <div>
          <small>Retiro a los</small>
          <b>{edad} años</b>
        </div>
        <div>
          <small><i style={{ background: 'var(--l73)' }} />Ley 73</small>
          <b>{money(v73)}</b>
        </div>
        <div>
          <small><i style={{ background: 'var(--l97)' }} />Ley 97</small>
          <b>{money(v97)}</b>
        </div>
        <div>
          <small>Diferencia</small>
          <b className={cmp.diff > 0 ? 'pos' : ''}>{money(cmp.diff)}</b>
        </div>
      </div>
    </div>
  )
}
