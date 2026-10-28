import Icon from './Icon.jsx'

const ICONO = { ok: 'check', info: 'info', warn: 'alert' }

// Control deslizante con etiqueta, valor, extremos del rango y mensaje de validación opcional.
// aviso = { tono: 'ok' | 'info' | 'warn', texto: string }
export default function Slider({ id, label, valor, ayuda, min, max, step = 1, value, onChange, fmt = String, aviso }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className={'field' + (aviso ? ' field-' + aviso.tono : '')}>
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="val">{valor}</output>
      </div>
      {ayuda && <p className="help">{ayuda}</p>}
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--p': pct + '%' }}
        aria-describedby={aviso ? id + '-hint' : undefined}
        onChange={(e) => onChange(+e.target.value)}
      />
      <div className="range-ends" aria-hidden="true">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
      {aviso && (
        <p id={id + '-hint'} className={'hint hint-' + aviso.tono}>
          <Icon name={ICONO[aviso.tono]} size={15} strokeWidth={2.2} />
          <span>{aviso.texto}</span>
        </p>
      )}
    </div>
  )
}
