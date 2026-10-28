// Pruebas de src/lib/ahorro.js. Se ejecutan con: npm test (usa node:test, sin dependencias).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  tasaMensual, mesesHastaRetiro, normalizar, simular, valorFuturo, diferencia, porAnio, compararInicio, saldoPlan,
} from './ahorro.js'

const cerca = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`)

test('la tasa mensual efectiva compone exactamente a la anual', () => {
  cerca(Math.pow(1 + tasaMensual(0.07), 12) - 1, 0.07)
  assert.equal(tasaMensual(0), 0)
  assert.equal(tasaMensual(-0.5), 0)
  assert.equal(tasaMensual('abc'), 0)
})

test('meses hasta el retiro', () => {
  assert.equal(mesesHastaRetiro(25, 65), 480)
  assert.equal(mesesHastaRetiro(65, 60), 0)
  assert.equal(mesesHastaRetiro(NaN, 65), 780)
})

test('la simulación coincide con la fórmula cerrada', () => {
  const casos = [
    { meses: 480, tasaAnual: 0.07, aportacion: 1000, saldoInicial: 0 },
    { meses: 360, tasaAnual: 0.1, aportacion: 2500, saldoInicial: 50000 },
    { meses: 480, tasaAnual: 0.07, aportacion: 1000, saldoInicial: 20000, retrasoAportaciones: 3 },
    { meses: 12, tasaAnual: 0.05, aportacion: 100, saldoInicial: 0 },
  ]
  for (const c of casos) cerca(simular(c).final, valorFuturo(c))
})

test('caso conocido: $1,000 al mes, 12 meses, 0% = $12,000', () => {
  const r = simular({ meses: 12, tasaAnual: 0, aportacion: 1000, saldoInicial: 0 })
  assert.equal(r.final, 12000)
  assert.equal(r.aportado, 12000)
  assert.equal(r.rendimientos, 0)
})

test('aportación al final del mes: el primer mes no genera rendimiento', () => {
  const r = simular({ meses: 1, tasaAnual: 0.12, aportacion: 1000, saldoInicial: 0 })
  assert.equal(r.final, 1000)
})

test('saldo inicial: un año al 7% crece exactamente 7%', () => {
  cerca(simular({ meses: 12, tasaAnual: 0.07, aportacion: 0, saldoInicial: 10000 }).final, 10700)
})

test('rendimiento cero: esperar 3 meses cuesta exactamente 3 aportaciones', () => {
  const r = compararInicio({ aportacion: 1000, edad: 30, retiro: 65, tasaAnual: 0 })
  assert.equal(r.dif.absoluta, 3000)
  assert.equal(r.aportacionNoHecha, 3000)
})

test('modo mensual: el saldo inicial se invierte hoy en ambos escenarios', () => {
  const sinAporte = compararInicio({ aportacion: 0, saldoInicial: 100000, edad: 30, retiro: 65, tasaAnual: 0.07 })
  assert.equal(sinAporte.dif.absoluta, 0)
  const conAporte = compararInicio({ aportacion: 1000, saldoInicial: 100000, edad: 30, retiro: 65, tasaAnual: 0.07 })
  const soloAportes = compararInicio({ aportacion: 1000, saldoInicial: 0, edad: 30, retiro: 65, tasaAnual: 0.07 })
  cerca(conAporte.dif.absoluta, soloAportes.dif.absoluta)
})

test('modo única: invertir 3 meses después equivale a 3 meses menos de crecimiento', () => {
  const r = compararInicio({ saldoInicial: 10000, edad: 25, retiro: 65, tasaAnual: 0.07 }, 'unica')
  const i = tasaMensual(0.07)
  cerca(r.hoy.final, 10000 * Math.pow(1 + i, 480))
  cerca(r.despues.final, 10000 * Math.pow(1 + i, 477))
  assert.equal(r.hoy.aportado, r.despues.aportado)
  assert.ok(r.dif.absoluta > 0)
})

test('el porcentaje usa como base el escenario "hoy"', () => {
  const d = diferencia(200, 150)
  assert.equal(d.absoluta, 50)
  assert.equal(d.pct, 25)
  assert.equal(diferencia(0, 0).pct, 0)
})

test('horizontes cortos y retiro no posterior', () => {
  const corto = compararInicio({ aportacion: 1000, edad: 64.9, retiro: 65, tasaAnual: 0.07 })
  assert.equal(corto.p.meses, 1)
  assert.equal(corto.despues.numAportaciones, 0)
  assert.equal(corto.despues.final, 0)
  const cero = compararInicio({ aportacion: 1000, edad: 65, retiro: 60, tasaAnual: 0.07 })
  assert.equal(cero.p.meses, 0)
  assert.equal(cero.hoy.final, 0)
  assert.equal(cero.dif.pct, 0)
})

test('valores inválidos nunca producen NaN ni negativos', () => {
  const r = compararInicio({ aportacion: -500, saldoInicial: 'x', edad: undefined, retiro: null, tasaAnual: NaN })
  for (const v of [r.hoy.final, r.despues.final, r.dif.absoluta, r.dif.pct, r.hoy.rendimientos]) {
    assert.ok(Number.isFinite(v), 'valor no finito')
    assert.ok(v >= 0, 'valor negativo')
  }
  const n = normalizar({ edad: 40, retiro: 30 })
  assert.equal(n.retiro, 40)
})

test('serie anual: un punto por año y el último mes', () => {
  assert.deepEqual(porAnio([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), [0, 12])
  assert.deepEqual(porAnio([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]), [0, 12, 14])
  const r = compararInicio({ aportacion: 1000, edad: 25, retiro: 65, tasaAnual: 0.07 })
  assert.equal(r.anios.hoy.length, 41)
  assert.equal(r.anios.hoy[40], r.hoy.final)
})

test('reto 3: empezar a los 25 acumula más que a los 35 con la misma aportación', () => {
  const a = saldoPlan({ aportacion: 1000, desde: 25, hasta: 65, tasaAnual: 0.07 })
  const b = saldoPlan({ aportacion: 1000, desde: 35, hasta: 65, tasaAnual: 0.07 })
  assert.ok(a.final / b.final > 2)
  assert.equal(a.aportado, 480000)
  assert.equal(b.aportado, 360000)
})
