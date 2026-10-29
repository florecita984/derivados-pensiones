// Interés compuesto de "Ahorrar" y su comparación con las leyes. Mismas fórmulas que la referencia.
import { anual } from './pension.js'

// Valor futuro: p invertido hoy más m al final de cada mes, n meses a la tasa mensual i.
export const fv = (p, m, i, n) => (i ? p * Math.pow(1 + i, n) + (m * (Math.pow(1 + i, n) - 1)) / i : p + m * n)

// Tasa mensual efectiva equivalente a un rendimiento anual en porcentaje (5 = 5%).
export const tasaMensual = (rt) => Math.pow(1 + rt / 100, 1 / 12) - 1

// s0 = ahorro de hoy; sm = ahorro mensual; rt = rendimiento anual %; ys = años; inf = inflación %; goal = meta.
export function calcAhorro({ s0, sm, rt, ys, inf, goal }) {
  const p = s0
  const m = sm
  const y = Math.round(ys)
  const i = tasaMensual(rt)
  const N = y * 12
  const F = fv(p, m, i, N)
  const put = p + m * N
  const real = F / Math.pow(1 + inf / 100, y)
  const need = i ? ((goal - p * Math.pow(1 + i, N)) * i) / (Math.pow(1 + i, N) - 1) : (goal - p) / N
  const w = y > 10 ? fv(p, m, i, N - 120) : 0 // si esperas 10 años para empezar
  // Cada año: lo que llevas aportado y lo que ya ganaron los intereses.
  const porAnio = Array.from({ length: y }, (_, k) => {
    const t = fv(p, m, i, (k + 1) * 12)
    const c = Math.min(p + m * 12 * (k + 1), t)
    return { anio: k + 1, total: t, aportado: c, intereses: t - c }
  })
  return { p, m, i, y, N, F, put, real, need, w, porAnio, pctIntereses: Math.round(((F - put) / F) * 100 || 0) }
}

// ¿Cuánto de la diferencia entre leyes cubre el plan de ahorro? Usa el retiro y la pensión de "Mi pensión"
// (r = calcPension) y el ahorro, el rendimiento y lo mensual de "Ahorrar" (h = calcAhorro).
export function compararConLeyes(r, h) {
  const R = r.d.ret
  const y = R - r.d.edad
  const N = y * 12
  const f = anual(R)
  const fm = Math.pow(1 + h.i, N)
  const F = fv(h.p, h.m, h.i, N)
  const mine = F / f // pensión mensual que daría el ahorro del plan
  const gap = r.a.p - r.b.p
  // Ahorro mensual necesario desde hoy para que el plan pague G al mes al retirarte.
  const necesita = (G) => {
    const x = h.i ? ((G * f - h.p * fm) * h.i) / (fm - 1) : (G * f - h.p) / N
    return x > 0 ? x : null
  }
  return {
    R, y, mine, gap,
    paraIgualar: gap > 0 ? necesita(gap) : null,
    cubre: Math.min(mine, gap),
    opciones: [
      { id: '73', nombre: 'Ley 73' + (r.a.ap ? ' (aprox.)' : ''), p: r.a.p },
      { id: '97', nombre: 'Ley 97', p: r.b.p },
      { id: 'plan', nombre: 'Tu plan de ahorro', p: mine },
      { id: '97plan', nombre: 'Ley 97 + tu plan', p: r.b.p + mine },
    ],
  }
}
