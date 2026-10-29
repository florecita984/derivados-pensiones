// Formato de cifras para la interfaz (no interviene en ningún cálculo).

export const money = (x) => '$' + Math.round(x).toLocaleString('es-MX')

// Formato corto para ejes: $850 mil, $1.2 M.
export const moneyCorto = (v) => {
  if (v >= 1e6) return '$' + (v / 1e6).toLocaleString('es-MX', { maximumFractionDigits: v >= 1e7 ? 0 : 1 }) + ' M'
  if (v >= 1e3) return '$' + Math.round(v / 1e3).toLocaleString('es-MX') + ' mil'
  return '$' + Math.round(v)
}

export const anios = (n) => n + (n === 1 ? ' año' : ' años')
export const entero = (n) => Math.round(n).toLocaleString('es-MX')
