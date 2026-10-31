// Modalidad 40 (solo Ley 73). Parte de la calculadora de referencia y se corrigió contra la ley:
// incrementos por semanas del art. 167, piso del art. 168 y cuota por año y tramo del art. 168 con su transitorio.
import { money } from './formato.js'
import { P, T, TOPE, MINIMA_73, aniosIncremento, cuotaPatronalCyV } from './pension.js'

// La cuota de Modalidad 40 suma: invalidez y vida 1.75% + 0.625%, gastos médicos de pensionados 1.05% + 0.375%,
// retiro 2% y cesantía y vejez obrera 1.125% (6.925% fijo), más la cuota patronal de cesantía y vejez, que aquí
// paga la persona y depende del tramo de salario y del año. En 2026, desde 4.01 UMA: 6.925% + 7.513% = 14.438%.
export const CUOTA_FIJA_M40 = 0.06925

// k = años desde 2026 (0 es 2026); sbc en pesos de hoy.
export const cuotaM40 = (k, sbc) => CUOTA_FIJA_M40 + cuotaPatronalCyV(k, sbc, P.uma, P.sm)

// Pensión a los 65, en pesos de hoy, sobre el promedio de las últimas 250 semanas.
// Sin asignaciones familiares, así que el tope del art. 169 no la limita; sí aplica el piso del art. 168.
export function pen40(prom, sem) {
  const t = T.find((r) => prom / P.sm <= r[0])
  return Math.max(prom * (t[1] + t[2] * aniosIncremento(Math.max(sem, 500))), MINIMA_73)
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
  ].map((o) => {
    if (!o.sbc) return { ...o, cuota: 0, total: 0, cuotas: [] }
    // Un porcentaje por cada año que pagues: la cuota sube cada enero hasta 2030.
    const cuotas = Array.from({ length: m }, (_, k) => cuotaM40(k, o.sbc))
    return { ...o, cuotas, cuota: o.sbc * cuotas[0], total: o.sbc * 12 * cuotas.reduce((a, b) => a + b, 0) }
  })
  const [sin, ahora, antes] = opciones

  const msg =
    (s2 < 500
      ? 'La Ley 73 no da pensión con menos de 500 semanas. Con las tuyas no llegas, así que estos montos son solo ilustrativos: se calculan como si tuvieras 500. '
      : 'Con las reglas nuevas estimamos que subirías ' + money(ahora.p - sin.p) + ' al mes frente a no hacer nada; con las de antes habrían sido ' + money(antes.p - sin.p) + '. Es una estimación, no una cantidad garantizada. ') +
    'Si sale igual a ' + money(MINIMA_73) + ', es la pensión mínima (1 salario mínimo más el 11% del decreto de 2004).' +
    (ur < P.sm ? ' Calculamos con 1 salario mínimo porque el IMSS no registra menos.' : '') +
    (ur > TOPE ? ' Solo cuenta hasta 25 UMA (' + money(TOPE) + ').' : '')

  return { u, s2, opciones, mx: Math.max(...opciones.map((o) => o.p), 1), gana: ahora.p - sin.p, ganaAntes: antes.p - sin.p, aprox: s2 < 500, msg }
}
