// Indicador circular de porcentaje (la parte coloreada se limita al 100%, el texto muestra el valor real).
export default function Ring({ value, color, size = 84, label }) {
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * Math.min(1, Math.max(0, value / 100))
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(value)}% ${label || ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray .7s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <span>{Math.round(value)}%</span>
    </div>
  )
}
