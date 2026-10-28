// Lógica de cálculo portada tal cual del HTML original (sin cambios de fórmulas).

export const P = {
  uma: 3566.22,
  sm: 315.04 * 30.4,
  gu: 0.035,
  gs: 0.045,
  r: 0.07,
  a0: 0.106376,
  ap: 0.010906,
  at: 0.15,
  g21: 7046,
}

const T = [
  [1, 0.8, 0.00563], [1.25, 0.7711, 0.00814], [1.5, 0.5818, 0.01178], [1.75, 0.4923, 0.0143],
  [2, 0.4267, 0.01615], [2.25, 0.3765, 0.01756], [2.5, 0.3368, 0.01868], [2.75, 0.3048, 0.01958],
  [3, 0.2783, 0.02033], [3.25, 0.256, 0.02096], [3.5, 0.237, 0.02149], [3.75, 0.2207, 0.02195],
  [4, 0.2065, 0.02235], [4.25, 0.1939, 0.02271], [4.5, 0.1829, 0.02302], [4.75, 0.173, 0.0233],
  [5, 0.1641, 0.02355], [5.25, 0.1561, 0.02377], [5.5, 0.1488, 0.02398], [5.75, 0.1422, 0.02416],
  [6, 0.1362, 0.02433], [1e9, 0.13, 0.0245],
]

const AN = { 61: 248.7147, 62: 244.6939, 64: 236.3211 }

export const money = (x) => '$' + Math.round(x).toLocaleString('es-MX')

const anual = (e) => {
  if (AN[e]) return AN[e]
  const k = Object.keys(AN)
    .map(Number)
    .sort((a, b) => Math.abs(a - e) - Math.abs(b - e))
    .slice(0, 2)
  return AN[k[0]] + ((AN[k[1]] - AN[k[0]]) / (k[1] - k[0])) * (e - k[0])
}

const sue = (s, k) => s * Math.pow(1 + P.gs, k)

export function ley73(d, ret, x11) {
  const xt = x11 ? 1.11 : 1
  const n = ret - d.edad
  const ks = []
  for (let k = Math.max(0, n - 5); k < n; k++) ks.push(sue(d.sbc, k))
  const prom = ks.reduce((a, b) => a + b, 0) / ks.length
  const sem = (d.anios + n) * 52
  const smf = P.sm * Math.pow(1 + P.gu, n)
  if (sem < 500) return { p: 0, falta: true }
  const t = T.find((r) => prom / smf <= r[0])
  let p =
    prom *
    (t[1] + (t[2] * (sem - 500)) / 52) *
    (1 - 0.05 * Math.max(0, 65 - ret)) *
    (1 + (d.par ? 0.15 : 0))
  p = Math.max(Math.min(p, prom), smf)
  return { p: p * xt, ult: sue(d.sbc, n - 1) }
}

export function ley97(d, ret, x11) {
  const xt = x11 ? 1.11 : 1
  const n = ret - d.edad
  let s = d.aho > 0 ? d.aho : d.sbc * 12 * 0.065 * d.anios * Math.pow(1 + P.r, d.anios / 2)
  for (let k = 0; k < n; k++) {
    const u = P.uma * Math.pow(1 + P.gu, k)
    const pc = Math.min(P.at, P.a0 + P.ap * k)
    const a = pc * 12 * Math.min(sue(d.sbc, k), 25 * u)
    s += a + (a * P.r) / 2 + s * P.r
  }
  const g = P.g21 * Math.pow(1 + P.gu, 2026 + n - 2021)
  return {
    p: Math.max(s / anual(ret), g) * xt,
    saldo: s,
    g,
    ult: sue(d.sbc, n - 1),
    sem: (d.anios + n) * 52,
  }
}

// Convierte las respuestas del formulario en el objeto de datos que usan las fórmulas.
export function datos({ edad, sbc, ini, ret, aho, par }) {
  return { edad, sbc, ini, ret, aho, par, anios: Math.max(0, Math.min(2026 - ini, edad - 16)) }
}

// Resultado completo de la pestaña "Mi pensión".
export function calcPension(f, x11) {
  const xt = x11 ? 1.11 : 1
  const d = datos(f)
  const a = ley73(d, d.ret, x11)
  const b = ley97(d, d.ret, x11)
  const mi73 = d.ini <= 1996

  const ratio73 = a.falta ? 'Menos de 500 semanas' : Math.round((a.p / a.ult) * 100) + '% de tu último sueldo'
  const ratio97 = Math.round((b.p / b.ult) * 100) + '% de tu último sueldo'

  const msg = a.falta
    ? ''
    : (mi73
        ? 'Tu ley es la 73. La Ley 97 es lo que te tocaría si hubieras empezado después de 1997.'
        : 'Tu ley es la 97. La Ley 73 es hipotética: ya solo aplica a quien empezó antes del 1 de julio de 1997.') +
      ' La Ley 73 pagaría ' + (a.p / b.p).toFixed(1) + ' veces lo de la Ley 97.'

  const w = []
  if (b.sem < 875) w.push('Con las semanas que juntarías no alcanzas el mínimo de la Ley 97 en 2026 (875).')
  if (b.p <= b.g * xt * 1.0001) w.push('Tu ahorro no alcanza: te pagarían la pensión garantizada.')
  if (d.ini > 1997 && d.anios < 29)
    w.push('Para aplicar la Ley 73 se necesitan unos 29 años cotizados o más hoy; aquí es solo comparación.')

  const ages = [60, 61, 62, 63, 64, 65].filter((e) => e > d.edad)
  const rows = ages.map((e) => [e, ley73(d, e, x11).p, ley97(d, e, x11).p])

  return { d, a, b, mi73, ratio73, ratio97, msg, adv: w.join(' '), rows }
}

function pen40(prom, sem) {
  const t = T.find((r) => prom / P.sm <= r[0])
  return Math.max(Math.min(prom, prom * (t[1] + (t[2] * (sem - 500)) / 52)), P.sm)
}

// Resultado de la pestaña "Modalidad 40".
export function calcM40({ u, sem, m }) {
  const w = Math.min(m * 52, 250)
  const s2 = sem + m * 52
  const mix = (s) => (w * s + (250 - w) * u) / 250
  const sAnt = 25 * P.uma
  const sAho = Math.max(u + P.uma, P.sm)
  const opciones = [
    ['Sin Modalidad 40', pen40(u, sem), 0],
    ['Ahora (último sueldo + 1 UMA)', pen40(mix(sAho), s2), sAho],
    ['Antes (hasta 25 UMA)', pen40(mix(sAnt), s2), sAnt],
  ]
  return { opciones, mx: Math.max(...opciones.map((r) => r[1])) }
}
