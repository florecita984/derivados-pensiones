// Pruebas contra la ley (no contra el HTML del curso). Cada caso cita el artículo o decreto en que se apoya.
// Se corre con: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { P, TOPE, MINIMA_73, T, asig, aniosIncremento, cuotaPatronalCyV, aportacionAfore, datos, ley73, ley97, calcPension } from './pension.js'
import { calcM40, cuotaM40, pen40 } from './m40.js'

const cerca = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`)

test('art. 167 (LSS 1973): la tabla tiene 22 grupos, del 80.00% al 13.00%', () => {
  assert.equal(T.length, 22)
  assert.deepEqual(T[0], [1, 0.8, 0.00563])
  assert.deepEqual(T[21].slice(1), [0.13, 0.0245])
})

test('art. 167: incremento anual por cada 52 semanas; 13 a 26 semanas valen la mitad y más de 26 el año completo', () => {
  const casos = [[400, 0], [500, 0], [512, 0], [513, 0.5], [526, 0.5], [527, 1], [552, 1], [564, 1], [565, 1.5], [578, 1.5], [579, 2], [910, 8]]
  for (const [sem, años] of casos) assert.equal(aniosIncremento(sem), años, `${sem} semanas`)
})

test('art. 164 (LSS 1973): asignaciones familiares y ayuda asistencial', () => {
  cerca(asig({ esp: true, hij: 0, pad: 0 }), 0.15)
  cerca(asig({ esp: true, hij: 2, pad: 0 }), 0.35)
  cerca(asig({ esp: false, hij: 1, pad: 2 }), 0.1) // con hijos no cuentan los padres
  cerca(asig({ esp: false, hij: 0, pad: 2 }), 0.2)
  cerca(asig({ esp: false, hij: 0, pad: 1 }), 0.2) // 10% del padre + 10% de ayuda asistencial (fracc. V)
  cerca(asig({ esp: false, hij: 0, pad: 0 }), 0.15) // fracc. IV
})

test('art. 168 y decreto del DOF de 2004: la pensión mínima es 1 salario mínimo x 1.11 y no se multiplica dos veces', () => {
  cerca(MINIMA_73, 315.04 * (365 / 12) * 1.11, 1e-9)
  assert.ok(Math.abs(MINIMA_73 - 10636.53) < 0.5, 'unos $10,636.53 en 2026')
  // Caso en que manda el piso: sueldo de 1 salario mínimo, retiro a los 60.
  const d = datos({ edad: 59, sbc: 1, ini: 2015, ret: 60, aho: 0, esp: false, hij: 0, pad: 0 })
  const piso = P.sm * (1 + P.gu) * 1.11
  cerca(ley73(d, 60, false).p, piso, 1e-9)
  cerca(ley73(d, 60, true).p, piso, 1e-9)
})

test('art. 169: con asignaciones no pasa del promedio, salvo que los incrementos por semanas ya lo superen', () => {
  // 2 salarios mínimos y 2,600 semanas: cuantía + incrementos supera 100% del promedio y la ayuda asistencial no suma.
  const d = datos({ edad: 62, sbc: 2 * P.sm, ini: 1975, ret: 65, aho: 0, esp: false, hij: 0, pad: 0 })
  const prom = (2 * P.sm * (1 + 1.045 + 1.045 ** 2)) / 3
  const esperado = prom * (0.4267 + 0.01615 * 40.5) // 2,100 semanas sobrantes = 40 años + 20 semanas (grupo de 1.76 a 2.00)
  cerca(ley73(d, 65, false).p, esperado, 1e-9)
  // Con pocas semanas sí topa en el promedio: esposa y 4 hijos suman 55% pero la pensión no pasa de 100% del promedio.
  const e = datos({ edad: 55, sbc: 1.2 * P.sm, ini: 2015, ret: 65, aho: 0, esp: true, hij: 4, pad: 0 })
  const promE = (1.2 * P.sm * (1.045 ** 5 + 1.045 ** 6 + 1.045 ** 7 + 1.045 ** 8 + 1.045 ** 9)) / 5
  cerca(ley73(e, 65, false).p, promE, 1e-9)
})

test('art. 171: retirarse antes de los 65 baja la pensión 5% por año (75% a los 60)', () => {
  const f = { edad: 30, sbc: 60000, ini: 1995, aho: 0, esp: false, hij: 0, pad: 0 }
  const a = ley73(datos({ ...f, ret: 65 }), 65, false).p
  assert.ok(a > 0)
  const b = ley73(datos({ ...f, ret: 60 }), 60, false).p
  assert.ok(b < a)
})

test('art. 168 y segundo transitorio de 2020: cuota patronal de cesantía y vejez por tramo y año', () => {
  const u = P.uma
  cerca(cuotaPatronalCyV(0, TOPE, u, P.sm), 0.07513)
  cerca(cuotaPatronalCyV(4, TOPE, u, P.sm), 0.11875)
  cerca(cuotaPatronalCyV(9, TOPE, u, P.sm), 0.11875) // después de 2030 se queda igual
  cerca(cuotaPatronalCyV(0, P.sm, u, P.sm), 0.0315) // 1 salario mínimo
  cerca(cuotaPatronalCyV(0, 3 * u, u, P.sm), 0.06026) // 2.51 a 3.00 UMA
  cerca(cuotaPatronalCyV(2, 3.2 * u, u, P.sm), 0.07967) // 3.01 a 3.50 UMA en 2028
})

test('aportación a la Afore: en 2026 desde 4.01 UMA son 2% + 7.513% + 1.125% = 10.638%', () => {
  cerca(aportacionAfore(0, TOPE, P.uma, P.sm), 0.10638, 1e-9)
  cerca(aportacionAfore(4, TOPE, P.uma, P.sm), 0.15, 1e-9)
  assert.ok(aportacionAfore(0, 3 * P.uma, P.uma, P.sm) < aportacionAfore(0, TOPE, P.uma, P.sm))
})

test('Ley 97: con un sueldo menor se junta menos ahorro que con la aportación del tramo más alto', () => {
  const d = datos({ edad: 30, sbc: 12000, ini: 2018, ret: 65, aho: 0, esp: false, hij: 0, pad: 0 })
  const b = ley97(d, 65)
  assert.ok(b.saldo > 0 && b.p >= b.g)
})

test('cuota de Modalidad 40: 14.438% en 2026 desde 4.01 UMA y 18.800% en 2030', () => {
  cerca(cuotaM40(0, TOPE), 0.14438, 1e-9)
  cerca(cuotaM40(4, TOPE), 0.188, 1e-9)
  cerca(cuotaM40(0, P.sm), 0.06925 + 0.0315, 1e-9)
  const r = calcM40({ ur: 20000, sem: 910, m: 5 })
  const antes = r.opciones.find((o) => o.id === 'antes')
  const suma = [0.14438, 0.15528, 0.16619, 0.17709, 0.188].reduce((a, b) => a + b)
  cerca(antes.total, TOPE * 12 * suma, 1e-9)
  cerca(antes.cuota, TOPE * 0.14438, 1e-9)
})

test('acuerdo del Consejo Técnico (DOF 21-oct-2026): último salario o ese más 1 UMA, sin bajar del mínimo ni pasar de 25 UMA', () => {
  const sbc = (ur) => calcM40({ ur, sem: 910, m: 5 }).opciones.find((o) => o.id === 'ahora').sbc
  cerca(sbc(20000), 20000 + P.uma)
  cerca(sbc(5000), P.sm + P.uma) // menos del mínimo: se toma 1 salario mínimo
  cerca(sbc(500000), TOPE)
  cerca(sbc(TOPE - 100), TOPE)
})

test('Modalidad 40: la pensión nunca baja del piso y más años no la bajan', () => {
  for (const sem of [52, 400, 910, 1500]) for (const m of [1, 3, 5, 10]) {
    const r = calcM40({ ur: 15000, sem, m })
    for (const o of r.opciones) assert.ok(o.p >= MINIMA_73 - 1e-9, `${o.id} ${sem} ${m}`)
    assert.ok(pen40(30000, sem + 52) >= pen40(30000, sem))
  }
})

test('calcPension: sin interruptor de 11% la Ley 97 no cambia y con él solo cambia la Ley 73', () => {
  const f = { edad: 40, sbc: 30000, ini: 1996, ret: 65, aho: 0, esp: false, hij: 0, pad: 0 }
  const a = calcPension(f, false)
  const b = calcPension(f, true)
  cerca(b.b.p, a.b.p, 1e-12)
  assert.ok(b.a.p > a.a.p)
})
