// Pensión por Ley 73 y Ley 97. Parte de la calculadora de referencia (pension_ley73_vs_ley97.html) y,
// desde la auditoría, se corrigió contra la ley (ver src/lib/ley.test.js, que cita cada artículo).
import { money } from './formato.js'

export const P = { uma: 3566.22, sm: (315.04 * 365) / 12, gu: 0.035, gs: 0.045, r: 0.07, g21: 7046 }
export const TOPE = 25 * P.uma // tope del sueldo base de cotización
// Rango del salario base de cotización: el control empieza en el salario mínimo y termina en 25 UMA, que es
// lo que el IMSS acepta registrar. Así la cifra que ves en el control es la que se usa en el cálculo.
export const RANGO_SBC = {
  min: P.sm,
  max: TOPE,
  step: 1000,
  curva: 1.6,
  razonMin: 'el IMSS no registra un salario menor al mínimo',
  razonMax: 'el IMSS solo toma hasta 25 UMA',
}
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

// Años de incremento del art. 167: uno por cada 52 semanas después de las primeras 500. Una fracción de
// 13 a 26 semanas da la mitad del incremento anual y más de 26 semanas lo da completo.
export function aniosIncremento(sem) {
  const extra = Math.max(0, sem - 500)
  const completos = Math.floor(extra / 52)
  const resto = extra - completos * 52
  return completos + (resto > 26 ? 1 : resto >= 13 ? 0.5 : 0)
}

// Cuota patronal de cesantía y vejez (art. 168, fracc. II, inciso a, y segundo transitorio de la reforma del
// DOF del 16-dic-2020). Fila: [límite superior en UMA, % de 2026, 2027, 2028, 2029, 2030]. Con 1 salario
// mínimo la cuota es 3.150% todos los años; después de 2030 se queda en el valor de 2030.
const CYV = [
  [1.5, 3.676, 3.807, 3.939, 4.07, 4.202],
  [2, 4.851, 5.276, 5.701, 6.126, 6.552],
  [2.5, 5.556, 6.157, 6.759, 7.36, 7.962],
  [3, 6.026, 6.745, 7.464, 8.183, 8.902],
  [3.5, 6.361, 7.164, 7.967, 8.77, 9.573],
  [4, 6.613, 7.479, 8.345, 9.211, 10.077],
  [Infinity, 7.513, 8.603, 9.694, 10.784, 11.875],
]
// k = años desde 2026; sbc, uma y sm en pesos del mismo año.
export function cuotaPatronalCyV(k, sbc, uma, sm) {
  if (sbc <= sm * (1 + 1e-9)) return 0.0315
  const fila = CYV.find((f) => sbc / uma <= f[0])
  return fila[1 + Math.min(Math.max(k, 0), 4)] / 100
}

// Aportación total a la Afore en un año: retiro 2% + cesantía y vejez patronal (por tramo) + obrera 1.125%.
// No incluye la cuota social del Gobierno ni la subcuenta de vivienda.
export const aportacionAfore = (k, sbc, uma, sm) => 0.02 + cuotaPatronalCyV(k, sbc, uma, sm) + 0.01125

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
  // Art. 167 (cuantía básica + incrementos) y art. 171 (retiro antes de los 65).
  const base = prom * (t[1] + t[2] * aniosIncremento(sem)) * (1 - 0.05 * Math.max(0, 65 - ret))
  // Art. 169: con asignaciones no pasa de tu salario promedio, salvo que los incrementos por semanas ya lo superen.
  const sinPasarse = Math.min(base * (1 + asig(d)), Math.max(prom, base))
  // Art. 168: el piso es 1 salario mínimo, con el factor de 1.11 del decreto de 2004, y ya lo incluye.
  // El interruptor del curso solo suma 11% a la pensión calculada, nunca otra vez al piso.
  const p = Math.max(sinPasarse * (x11 ? 1.11 : 1), smf * 1.11)
  return { p, ult: sue(d.sbc, n - 1), ap: sem0 < 500 }
}

// El 11% del curso no se aplica a la Ley 97: el decreto de 2004 habla de pensiones de la Ley 73.
export function ley97(d, ret) {
  const n = ret - d.edad
  let s = d.aho > 0 ? d.aho : d.sbc * 12 * 0.065 * d.anios * Math.pow(1 + P.r, d.anios / 2)
  for (let k = 0; k < n; k++) {
    const f = Math.pow(1 + P.gu, k)
    const u = P.uma * f
    const sbc = Math.min(sue(d.sbc, k), 25 * u)
    const a = aportacionAfore(k, sbc, u, P.sm * f) * 12 * sbc
    s += a + (a * P.r) / 2 + s * P.r
  }
  // Pensión garantizada (art. 170): aproximación entre $3,540.56 y $11,128.01 de 2026 según edad, semanas y sueldo.
  const cl = (x) => Math.min(1, Math.max(0, x))
  const g =
    (3540.56 + (7587.45 * (cl((ret - 60) / 5) + cl(((d.anios + n) * 52 - 875) / 250) + cl((d.sbc / P.uma - 1.99) / 3.01))) / 3) *
    Math.pow(1 + P.gu, n)
  return { p: Math.max(s / anual(ret), g), saldo: s, g, ult: sue(d.sbc, n - 1), sem: (d.anios + n) * 52 }
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
  const b = ley97(d, d.ret)
  const mi73 = d.ini <= 1996
  const veces = a.p / b.p

  const msg =
    (a.ap ? 'La Ley 73 no da pensión con menos de 500 semanas. Con las que juntarías no llegas, así que ese monto es solo ilustrativo: lo calculamos como si tuvieras 500. ' : '') +
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
  const garantizada = b.p <= b.g * 1.0001
  if (garantizada) avisos.push('Tu ahorro no alcanza: te pagarían la pensión garantizada.')
  if (d.ini > 1997 && d.anios < 29) avisos.push('Para aplicar la Ley 73 se necesitan unos 29 años cotizados o más hoy; aquí es solo comparación.')

  const filas = EDADES_RETIRO.filter((e) => e > d.edad).map((e) => [e, ley73(d, e, x11).p, ley97(d, e).p])

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
