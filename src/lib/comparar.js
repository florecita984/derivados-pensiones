// Compara dos pensiones ya calculadas (solo presentación; no altera ningún cálculo).
export function comparar(p73, p97) {
  const mayor = p73 >= p97 ? '73' : '97'
  const hi = Math.max(p73, p97)
  const lo = Math.min(p73, p97)
  return {
    mayor,
    diff: hi - lo,
    pct: lo > 0 ? ((hi - lo) / lo) * 100 : null,
    veces: lo > 0 ? hi / lo : null,
  }
}
