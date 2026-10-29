// Utilidades de presentación para las gráficas (no intervienen en ningún cálculo).

// Formato corto para ejes: $850 mil, $1.2 M.
export const moneyCorto = (v) => {
  if (v >= 1e6) return '$' + (v / 1e6).toLocaleString('es-MX', { maximumFractionDigits: v >= 1e7 ? 0 : 1 }) + ' M'
  if (v >= 1e3) return '$' + Math.round(v / 1e3).toLocaleString('es-MX') + ' mil'
  return '$' + Math.round(v)
}

// Escala "redonda": paso legible (1, 2, 2.5 o 5 × 10^k) y máximo múltiplo de ese paso.
export function escala(v, partes) {
  const bruto = Math.max(v, 1) / partes
  const e = Math.pow(10, Math.floor(Math.log10(bruto)))
  const m = bruto / e
  const paso = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e
  const max = Math.ceil(Math.max(v, 1) / paso) * paso
  return { max, ticks: Array.from({ length: Math.round(max / paso) + 1 }, (_, i) => i * paso) }
}
