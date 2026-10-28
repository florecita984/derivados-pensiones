// Interés compuesto para la sección "Ahorra". Funciones puras: no tocan la interfaz ni calc.js.
//
// Convenciones:
//  - Capitalización mensual con la tasa mensual EFECTIVA equivalente a la anual: (1 + anual)^(1/12) - 1.
//    Así, 12 meses de rendimiento equivalen exactamente al rendimiento anual elegido.
//  - Las aportaciones se hacen al FINAL de cada mes (anualidad vencida).
//  - Un retraso de k meses significa que las primeras k aportaciones no se hacen; el retiro es la misma fecha.
//  - Resultados en pesos nominales del retiro: es un saldo acumulado, no una pensión mensual.

import { P } from './calc.js'

export const RETRASO_MESES = 3
export const RENDIMIENTO_BASE = P.r
// Mismo valor en porcentaje, redondeado para los controles (0.07 * 100 da 7.000000000000001 en coma flotante).
export const RENDIMIENTO_BASE_PCT = Math.round(P.r * 1000) / 10

// Número finito y no negativo; cualquier otra cosa se vuelve el valor de respaldo.
export function limpiar(v, respaldo = 0) {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : respaldo
}

// Tasa mensual efectiva equivalente a una tasa anual (0.07 = 7%).
export function tasaMensual(anual) {
  const a = limpiar(anual)
  return Math.pow(1 + a, 1 / 12) - 1
}

// Meses completos entre la edad actual y la de retiro (0 si el retiro no es posterior).
export function mesesHastaRetiro(edad, retiro) {
  const n = Math.round((limpiar(retiro) - limpiar(edad)) * 12)
  return Math.max(0, n)
}

// Normaliza los parámetros del simulador. Nunca devuelve NaN ni negativos.
export function normalizar({ aportacion, saldoInicial = 0, edad, retiro, tasaAnual = RENDIMIENTO_BASE } = {}) {
  const e = limpiar(edad, 25)
  const r = Math.max(e, limpiar(retiro, 65))
  return {
    aportacion: limpiar(aportacion),
    saldoInicial: limpiar(saldoInicial),
    edad: e,
    retiro: r,
    tasaAnual: limpiar(tasaAnual, RENDIMIENTO_BASE),
    meses: mesesHastaRetiro(e, r),
  }
}

/**
 * Simula mes a mes un escenario de ahorro.
 * @param {object} p
 * @param {number} p.meses            horizonte en meses
 * @param {number} p.tasaAnual        rendimiento anual (0.07 = 7%)
 * @param {number} p.aportacion       aportación mensual
 * @param {number} p.saldoInicial     monto invertido de una sola vez
 * @param {number} [p.retrasoAportaciones=0]  meses sin aportar al inicio
 * @param {number} [p.retrasoSaldo=0]         meses que tarda en invertirse el saldo inicial
 * @returns {{final:number, aportado:number, rendimientos:number, numAportaciones:number, serie:number[]}}
 *   serie[m] = saldo al final del mes m (serie[0] = saldo de hoy).
 */
export function simular({ meses, tasaAnual, aportacion, saldoInicial, retrasoAportaciones = 0, retrasoSaldo = 0 }) {
  const n = Math.floor(limpiar(meses))
  const i = tasaMensual(tasaAnual)
  const pago = limpiar(aportacion)
  const s0 = limpiar(saldoInicial)
  const rA = Math.floor(limpiar(retrasoAportaciones))
  const rS = Math.floor(limpiar(retrasoSaldo))

  // Si el saldo se retrasa más allá del horizonte, nunca llega a invertirse.
  const saldoEntra = rS <= n
  let s = rS === 0 ? s0 : 0
  const serie = [s]
  let num = 0
  for (let m = 1; m <= n; m++) {
    s *= 1 + i
    if (m > rA) {
      s += pago
      num++
    }
    if (rS > 0 && m === rS) s += s0
    serie.push(s)
  }
  const aportado = pago * num + (saldoEntra ? s0 : 0)
  return { final: s, aportado, rendimientos: s - aportado, numAportaciones: num, serie }
}

// Valor futuro con fórmula cerrada (sirve para verificar la simulación).
export function valorFuturo({ meses, tasaAnual, aportacion = 0, saldoInicial = 0, retrasoAportaciones = 0 }) {
  const n = Math.floor(limpiar(meses))
  const k = Math.max(0, n - Math.floor(limpiar(retrasoAportaciones)))
  const i = tasaMensual(tasaAnual)
  const crec = (t) => Math.pow(1 + i, t)
  const anualidad = i === 0 ? limpiar(aportacion) * k : (limpiar(aportacion) * (crec(k) - 1)) / i
  return limpiar(saldoInicial) * crec(n) + anualidad
}

// Diferencia entre dos saldos finales. La base del porcentaje es SIEMPRE el escenario "hoy".
export function diferencia(hoy, despues) {
  const d = hoy - despues
  return { absoluta: d, pct: hoy > 0 ? (d / hoy) * 100 : 0 }
}

// Serie anual (un punto por año cumplido, más el último mes si el horizonte no es exacto).
export function porAnio(serie) {
  const out = []
  for (let m = 0; m < serie.length; m += 12) out.push(serie[m])
  if ((serie.length - 1) % 12 !== 0) out.push(serie[serie.length - 1])
  return out
}

/**
 * Compara "Empiezo hoy" contra "Empiezo en 3 meses".
 * modo 'mensual': el saldo inicial se invierte hoy en AMBOS escenarios; solo se retrasan las aportaciones.
 * modo 'unica':   no hay aportaciones mensuales; lo que se retrasa es la inversión del monto único.
 */
export function compararInicio(params, modo = 'mensual', retraso = RETRASO_MESES) {
  const p = normalizar(params)
  const base = { meses: p.meses, tasaAnual: p.tasaAnual }
  const unica = modo === 'unica'
  const comun = unica
    ? { ...base, aportacion: 0, saldoInicial: p.saldoInicial }
    : { ...base, aportacion: p.aportacion, saldoInicial: p.saldoInicial }

  const hoy = simular(comun)
  const despues = simular(unica ? { ...comun, retrasoSaldo: retraso } : { ...comun, retrasoAportaciones: retraso })
  const dif = diferencia(hoy.final, despues.final)

  return {
    p,
    modo: unica ? 'unica' : 'mensual',
    hoy,
    despues,
    dif,
    anios: { hoy: porAnio(hoy.serie), despues: porAnio(despues.serie) },
    // Lo que se deja de aportar por esperar (en modo mensual) frente a lo que se pierde al final.
    aportacionNoHecha: unica ? 0 : hoy.aportado - despues.aportado,
  }
}

// Saldo final de un plan de ahorro mensual que empieza a cierta edad (usado por los retos).
export function saldoPlan({ aportacion, desde, hasta, tasaAnual = RENDIMIENTO_BASE, saldoInicial = 0 }) {
  const p = normalizar({ aportacion, saldoInicial, edad: desde, retiro: hasta, tasaAnual })
  return simular(p)
}
