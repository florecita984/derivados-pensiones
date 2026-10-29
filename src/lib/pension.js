// Pensión por Ley 73 y Ley 97. Fórmulas y textos tal cual la calculadora de referencia
// (pension_ley73_vs_ley97.html); src/lib/paridad.test.js comprueba que den lo mismo.
import { money } from './formato.js'

export const P = { uma: 3566.22, sm: (315.04 * 365) / 12, gu: 0.035, gs: 0.045, r: 0.07, a0: 0.106376, ap: 0.010906, at: 0.15, g21: 7046 }
export const TOPE = 25 * P.uma // tope del sueldo base de cotización
export const MINIMA_73 = P.sm * 1.11 // pensión mínima de la Ley 73: 1 salario mínimo + 11% del decreto
export const EDADES_RETIRO = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75]

// Tabla del art. 167: [veces el salario mínimo, cuantía básica, incremento anual]
export const T = [
  [1, 0.8, 0.00563], [1.25, 0.7711, 0.00814], [1.5, 0.5818, 0.01178], [1.75, 0.4923, 0.0143],
  [2, 0.4267, 0.01615], [2.25, 0.3765, 0.01756], [2.5, 0.3368, 0.01868], [2.75, 0.3048, 0.01958],
  [3, 0.2783, 0.02033], [3.25, 0.256, 0.02096], [3.5, 0.237, 0.02149], [3.75, 0.2207, 0.02195],
  [4, 0.2065, 0.02235], [4.25, 0.1939, 0.02271], [4.5, 0.1829, 0.02302], [4.75, 0.173, 0.0233],
  [5, 0.1641, 0.02355], [5.25, 0.1561, 0.02377], [5.5, 0.1488, 0.02398], [5.75, 0.1422, 0.02416],
  [6, 0.1362, 0.02433], [1e9, 0.13, 0.0245],
]

// Factor de anualidad del curso: exacto a los 61, 62 y 64; en otras edades se interpola o extrapola.
const AN = { 61: 248.7147, 62: 244.6939, 64: 236.3211 }
export function anual(e) {
  if (AN[e]) return AN[e]
  const k = Object.keys(AN).map(Number).sort((a, b) => Math.abs(a - e) - Math.abs(b - e)).slice(0, 2)
  return AN[k[0]] + ((AN[k[1]] - AN[k[0]]) / (k[1] - k[0])) * (e - k[0])
}

// Sueldo k años después, sin pasar de 25 UMA de ese año.
const sue = (s, k) => Math.min(s * Math.pow(1 + P.gs, k), 25 * P.uma * Math.pow(1 + P.gu, k))

// Asignaciones familiares de la Ley 73 (art. 164): esposa(o) e hijos; si no hay, padres; si no hay nadie, ayuda asistencial.
export const asig = (d) =>
  d.esp || d.hij ? (d.esp ? 0.15 : 0) + 0.1 * d.hij : d.pad ? 0.1 * d.pad + (d.pad === 1 ? 0.1 : 0) : 0.15

export function ley73(d, ret, x11) {
  const n = ret - d.edad
  const ks = []
  for (let k = Math.max(0, n - 5); k < n; k++) ks.push(sue(d.sbc, k))
  const prom = ks.reduce((a, b) => a + b, 0) / ks.length
  const sem0 = (d.anios + n) * 52
  const sem = Math.max(sem0, 500)
  const smf = P.sm * Math.pow(1 + P.gu, n)
  const t = T.find((r) => prom / smf <= r[0])
  let p = prom * (t[1] + (t[2] * (sem - 500)) / 52) * (1 - 0.05 * Math.max(0, 65 - ret)) * (1 + asig(d))
  p = Math.max(Math.min(p, prom), smf * 1.11)
  return { p: p * (x11 ? 1.11 : 1), ult: sue(d.sbc, n - 1), ap: sem0 < 500 }
}

export function ley97(d, ret, x11) {
  const n = ret - d.edad
  let s = d.aho > 0 ? d.aho : d.sbc * 12 * 0.065 * d.anios * Math.pow(1 + P.r, d.anios / 2)
  for (let k = 0; k < n; k++) {
    const u = P.uma * Math.pow(1 + P.gu, k)
    const pc = Math.min(P.at, P.a0 + P.ap * k)
    const a = pc * 12 * Math.min(sue(d.sbc, k), 25 * u)
    s += a + (a * P.r) / 2 + s * P.r
  }
  // Pensión garantizada (art. 170): aproximación entre $3,540.56 y $11,128.01 de 2026 según edad, semanas y sueldo.
  const cl = (x) => Math.min(1, Math.max(0, x))
  const g =
    (3540.56 + (7587.45 * (cl((ret - 60) / 5) + cl(((d.anios + n) * 52 - 875) / 250) + cl((d.sbc / P.uma - 1.99) / 3.01))) / 3) *
    Math.pow(1 + P.gu, n)
  return { p: Math.max(s / anual(ret), g) * (x11 ? 1.11 : 1), saldo: s, g, ult: sue(d.sbc, n - 1), sem: (d.anios + n) * 52 }
}

// Respuestas del formulario -> datos que usan las fórmulas. El sueldo se toma entre 1 salario mínimo y 25 UMA.
export function datos({ edad, sbc, ini, ret, aho, esp, hij, pad }) {
  return { edad, raw: sbc, sbc: Math.min(Math.max(sbc, P.sm), TOPE), ini, ret, aho, esp, hij, pad, anios: Math.max(0, Math.min(2026 - ini, edad - 15)) }
}

// La edad de retiro va de los 60 a los 75 y siempre después de la edad actual.
export const retiroMinimo = (edad) => Math.max(60, edad + 1)

// Resultado completo de "Mi pensión", con los mismos mensajes de la referencia.
export function calcPension(f, x11) {
  const d = datos(f)
  const a = ley73(d, d.ret, x11)
  const b = ley97(d, d.ret, x11)
  const mi73 = d.ini <= 1996
  const veces = a.p / b.p

  const msg =
    (a.ap ? 'Con las semanas que juntarías no llegas a las 500 que pide la Ley 73, así que mostramos un aproximado con 500. ' : '') +
    (mi73
      ? 'Tu ley es la 73. La Ley 97 es lo que te tocaría si hubieras empezado después de 1997.'
      : 'Tu ley es la 97. La Ley 73 es hipotética: ya solo aplica a quien empezó antes del 1 de julio de 1997.') +
    ' La Ley 73 pagaría ' + veces.toFixed(1) + ' veces lo de la Ley 97.'

  const avisos = []
  const rq = Math.min(1000, 875 + 25 * (d.ret - d.edad)) // semanas mínimas de la Ley 97 el año en que te retiras
  if (b.sem < rq) avisos.push('Con ' + b.sem + ' semanas no alcanzas el mínimo de la Ley 97 para ese año (' + rq + ').')
  if (d.raw < P.sm) avisos.push('Calculamos con 1 salario mínimo (' + money(P.sm) + '): el IMSS no registra menos.')
  if (d.raw > TOPE) avisos.push('El IMSS solo toma hasta 25 UMA (' + money(TOPE) + ').')
  if (2026 - d.ini > d.edad - 15) avisos.push('Ajustamos tus años cotizados: no se empieza a cotizar antes de los 15 años.')
  const garantizada = b.p <= b.g * (x11 ? 1.11 : 1) * 1.0001
  if (garantizada) avisos.push('Tu ahorro no alcanza: te pagarían la pensión garantizada.')
  if (d.ini > 1997 && d.anios < 29) avisos.push('Para aplicar la Ley 73 se necesitan unos 29 años cotizados o más hoy; aquí es solo comparación.')

  const filas = EDADES_RETIRO.filter((e) => e > d.edad).map((e) => [e, ley73(d, e, x11).p, ley97(d, e, x11).p])

  return {
    d, a, b, mi73, veces, msg, avisos, filas, rq, garantizada,
    anioRetiro: 2026 + d.ret - d.edad,
    textos: {
      p73: (a.ap ? '≈ ' : '') + money(a.p),
      p97: money(b.p),
      r73: a.ap ? 'Aprox. con 500 semanas (el mínimo)' : Math.round((a.p / a.ult) * 100) + '% de tu último sueldo',
      r97: Math.round((b.p / b.ult) * 100) + '% de tu último sueldo',
    },
  }
}
