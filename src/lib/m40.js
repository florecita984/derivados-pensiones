// Modalidad 40 (solo Ley 73). Mismas fórmulas que la calculadora de referencia.
import { money } from './formato.js'
import { P, T, TOPE, MINIMA_73 } from './pension.js'

export const CUOTA_M40 = 0.14438 // cuota mensual 2026 sobre el sueldo con que te registras

// Pensión a los 65, en pesos de hoy, sobre el promedio de las últimas 250 semanas.
export function pen40(prom, sem) {
  const s = Math.max(sem, 500)
  const t = T.find((r) => prom / P.sm <= r[0])
  return Math.max(Math.min(prom, prom * (t[1] + (t[2] * (s - 500)) / 52)), MINIMA_73)
}

// ur = último sueldo que escribió la persona; sem = semanas cotizadas; m = años en Modalidad 40.
export function calcM40({ ur, sem, m }) {
  const u = Math.min(Math.max(ur, P.sm), TOPE)
  const w = Math.min(m * 52, 250)
  const s2 = sem + m * 52
  const mix = (s) => (w * s + (250 - w) * u) / 250
  const sAnt = TOPE
  const sAho = Math.min(u + P.uma, TOPE)
  const opciones = [
    { id: 'sin', nombre: 'Sin Modalidad 40', p: pen40(u, sem), sbc: 0 },
    { id: 'ahora', nombre: 'Ahora (último sueldo + 1 UMA)', p: pen40(mix(sAho), s2), sbc: sAho },
    { id: 'antes', nombre: 'Antes (hasta 25 UMA)', p: pen40(mix(sAnt), s2), sbc: sAnt },
  ].map((o) => ({ ...o, cuota: o.sbc * CUOTA_M40, total: o.sbc * CUOTA_M40 * 12 * m }))
  const [sin, ahora, antes] = opciones

  const msg =
    (s2 < 500
      ? 'Con tus semanas no llegas a las 500 de la Ley 73: los montos son aproximados, calculados con 500 semanas. '
      : 'Con las reglas nuevas ganas ' + money(ahora.p - sin.p) + ' al mes frente a no hacer nada; con las de antes habrías ganado ' + money(antes.p - sin.p) + '. ') +
    'Si sale igual a ' + money(MINIMA_73) + ', es la pensión mínima garantizada (1 salario mínimo + 11% del decreto).' +
    (ur < P.sm ? ' Calculamos con 1 salario mínimo porque el IMSS no registra menos.' : '') +
    (ur > TOPE ? ' Solo cuenta hasta 25 UMA (' + money(TOPE) + ').' : '')

  return { u, s2, opciones, mx: Math.max(...opciones.map((o) => o.p), 1), gana: ahora.p - sin.p, ganaAntes: antes.p - sin.p, aprox: s2 < 500, msg }
}
