import { useEffect, useRef, useState } from 'react'
import { money } from '../lib/calc.js'

// Formato corto para ejes: $850 k, $1.2 M.
export const moneyCorto = (v) => {
  if (v >= 1e6) return '$' + (v / 1e6).toLocaleString('es-MX', { maximumFractionDigits: v >= 1e7 ? 0 : 1 }) + ' M'
  if (v >= 1e3) return '$' + Math.round(v / 1e3).toLocaleString('es-MX') + ' k'
  return '$' + Math.round(v)
}

// Con un punto por año la serie ya es densa: segmentos rectos evitan las ondulaciones de una curva por tramos.
const linea = (pts) => pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ')
const relleno = (pts, base) => `${linea(pts)} L${pts[pts.length - 1][0].toFixed(1)},${base} L${pts[0][0].toFixed(1)},${base} Z`

// Escala "redonda": paso legible (1, 2, 2.5 o 5 × 10^k) y máximo múltiplo de ese paso.
function escala(v, partes) {
  const bruto = Math.max(v, 1) / partes
  const e = Math.pow(10, Math.floor(Math.log10(bruto)))
  const m = bruto / e
  const paso = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e
  const max = Math.ceil(Math.max(v, 1) / paso) * paso
  return { max, ticks: Array.from({ length: Math.round(max / paso) + 1 }, (_, i) => i * paso) }
}

// Ancho real del contenedor para dibujar el SVG a escala 1:1 (texto legible también en móvil).
function useAncho(ref, inicial = 760) {
  const [w, setW] = useState(inicial)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

// Gráfica de saldo acumulado por año: "Empiezo hoy" vs "Empiezo en 3 meses",
// con una banda inferior que muestra cómo crece la diferencia entre ambos.
// anio = índice seleccionado con el slider; el cursor muestra temporalmente otro año.
export default function CrecimientoChart({ hoy, despues, edad, anio, onAnio }) {
  const caja = useRef(null)
  const W = useAncho(caja)
  const [hover, setHover] = useState(null)
  const n = hoy.length
  const act = Math.min(hover ?? anio, n - 1)

  const angosto = W < 520
  const H = angosto ? 300 : 340
  const pl = angosto ? 52 : 64
  const pr = 16
  const pt = 16
  const gapH = angosto ? 54 : 64
  const base = H - 34 - gapH - 34
  const gapBase = H - 34
  const { max: mx, ticks } = escala(Math.max(...hoy), 4)
  const gaps = hoy.map((v, i) => Math.max(0, v - despues[i]))
  const gmx = escala(Math.max(...gaps), 1).max

  const x = (i) => (n <= 1 ? pl : pl + ((W - pl - pr) * i) / (n - 1))
  const y = (v) => base - ((base - pt) * v) / mx
  const gy = (v) => gapBase - (gapH * v) / gmx
  const pa = hoy.map((v, i) => [x(i), y(v)])
  const pb = despues.map((v, i) => [x(i), y(v)])
  const cadaX = [1, 2, 5, 10, 20].find((p) => (n - 1) / p <= (angosto ? 5 : 9)) || 20
  const conEtiqueta = (i) => (i % cadaX === 0 && (n - 1 - i >= cadaX * 0.6 || i === n - 1)) || i === n - 1
  const barW = Math.max(2, Math.min(14, ((W - pl - pr) / Math.max(1, n)) * 0.55))

  const indice = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    return Math.max(0, Math.min(n - 1, Math.round(((px - pl) / (W - pl - pr)) * (n - 1))))
  }
  const alMover = (e) => setHover(indice(e))
  // En pantallas táctiles no hay "hover": tocar la gráfica fija el año seleccionado.
  const alTocar = (e) => {
    if (e.pointerType !== 'mouse') onAnio(indice(e))
    else setHover(indice(e))
  }

  const izq = (x(act) / W) * 100
  const tipAlLado = izq > 62

  return (
    <div className="gc" ref={caja}>
      <div className="legend">
        <span><i style={{ background: 'var(--sA)' }} />Empiezo hoy</span>
        <span><i className="dash" style={{ borderColor: 'var(--sB)' }} />Empiezo en 3 meses</span>
        <span><i style={{ background: 'var(--gap)' }} />Diferencia acumulada</span>
      </div>

      <div className="gc-plot">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Saldo acumulado por año en ambos escenarios y diferencia entre ellos"
          onPointerMove={alMover}
          onPointerLeave={() => setHover(null)}
          onPointerDown={alTocar}
        >
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={i === 0 ? '0' : '2 6'} />
              <text x={pl - 10} y={y(t) + 4} className="ax" textAnchor="end">{moneyCorto(t)}</text>
            </g>
          ))}

          <path d={relleno(pa, base)} fill="var(--sA)" opacity=".07" className="gc-anim" />
          <path d={linea(pb)} fill="none" stroke="var(--sB)" strokeWidth="2.25" strokeDasharray="7 5" strokeLinecap="round" className="gc-anim" />
          <path d={linea(pa)} fill="none" stroke="var(--sA)" strokeWidth="2.5" strokeLinecap="round" className="gc-anim" />

          {/* Banda inferior: diferencia entre escenarios */}
          <text x={pl + 2} y={gapBase - gapH - 8} className="ax ax-t">Diferencia entre escenarios</text>
          <line x1={pl} x2={W - pr} y1={gy(gmx)} y2={gy(gmx)} stroke="var(--line)" strokeDasharray="2 6" />
          <text x={pl - 10} y={gy(gmx) + 4} className="ax" textAnchor="end">{moneyCorto(gmx)}</text>
          <line x1={pl} x2={W - pr} y1={gapBase} y2={gapBase} stroke="var(--line-2)" />
          {gaps.map((g, i) => (
            <rect
              key={i}
              x={x(i) - barW / 2}
              y={gy(g)}
              width={barW}
              height={Math.max(0, gapBase - gy(g))}
              rx={Math.min(2, barW / 2)}
              fill={i === act ? 'var(--sB)' : 'var(--gap)'}
              className="gc-bar"
            />
          ))}

          {hoy.map((_, i) =>
            conEtiqueta(i) ? (
              <text key={i} x={x(i)} y={H - 10} className={'ax' + (i === act ? ' ax-on' : '')} textAnchor="middle">
                {Math.round(edad + i)}
              </text>
            ) : null,
          )}

          <line x1={x(act)} x2={x(act)} y1={pt} y2={gapBase} stroke="var(--navy)" strokeWidth="1" opacity=".35" />
          <circle cx={x(act)} cy={y(despues[act])} r="5" fill="var(--card)" stroke="var(--sB)" strokeWidth="2.5" />
          <circle cx={x(act)} cy={y(hoy[act])} r="5.5" fill="var(--card)" stroke="var(--sA)" strokeWidth="2.5" />
        </svg>

        {hover != null && (
          <div className={'gc-tip' + (tipAlLado ? ' izq' : '')} style={{ left: izq + '%' }} role="presentation">
            <b>A los {Math.round(edad + act)} años</b>
            <span><i style={{ background: 'var(--sA)' }} />Hoy<em>{money(hoy[act])}</em></span>
            <span><i style={{ background: 'var(--sB)' }} />En 3 meses<em>{money(despues[act])}</em></span>
            <span className="gc-tip-d">Diferencia<em>{money(gaps[act])}</em></span>
          </div>
        )}
      </div>

      <p className="sr">Eje horizontal: edad. Eje vertical: saldo acumulado en pesos.</p>
    </div>
  )
}
