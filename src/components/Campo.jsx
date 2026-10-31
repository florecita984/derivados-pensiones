import { useRef, useState } from 'react'
import Icon from './Icon.jsx'

const POS = 1000 // posiciones del deslizador cuando la escala es curva

// Número a partir de lo que la persona escribió. En montos la coma separa miles ("20,000");
// en porcentajes puede ser el punto decimal ("7,5").
function leer(texto, decimal) {
  const t = String(texto).replace(/[^\d.,-]/g, '')
  const n = parseFloat(decimal ? t.replace(',', '.') : t.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

// Pregunta con deslizador. La cifra grande se puede tocar para escribirla tal cual (como en la
// referencia, lo escrito no se redondea al paso del deslizador si el paso es mayor que 1).
//   curva > 1 da más recorrido a los valores bajos: con sueldos de $0 a $500,000, los
//   $20,000 de un sueldo común quedarían pegados al inicio de un deslizador lineal.
//   razonMin / razonMax: si lo escrito cae fuera del rango se avisa por qué y con qué cifra se calcula.
export default function Campo({ id, label, ayuda, value, onChange, min, max, step = 1, curva = 1, format = String, mostrar, razonMin, razonMax }) {
  const [borrador, setBorrador] = useState(null)
  const [aviso, setAviso] = useState(null)
  const cancelado = useRef(false)
  const decimal = step < 1
  const texto = mostrar ?? format(value)

  const ajustar = (v) => {
    const x = Math.min(max, Math.max(min, v))
    return step <= 1 ? Math.round(x / step) * step : x
  }
  const enPos = (v) => (max > min ? Math.round(POS * Math.pow((v - min) / (max - min), 1 / curva)) : POS)
  // Si el mínimo no es múltiplo del paso (p. ej. el salario mínimo), los valores se redondean al paso y no a partir del mínimo.
  const desdeCero = step > 1 && min % step !== 0
  const dePos = (p) => {
    if (desdeCero && p <= 0) return min // los extremos son exactos: el salario mínimo y el tope
    if (desdeCero && p >= POS) return max
    const crudo = min + (max - min) * Math.pow(p / POS, curva)
    const v = desdeCero ? Math.round(crudo / step) * step : min + Math.round((crudo - min) / step) * step
    return Math.min(max, Math.max(min, v))
  }
  const curvo = curva !== 1 || desdeCero
  const rango = curvo
    ? { min: 0, max: POS, step: 1, value: enPos(value), onChange: (e) => onChange(dePos(+e.target.value)) }
    : { min, max, step, value, onChange: (e) => onChange(+e.target.value) }
  const pct = rango.max > rango.min ? ((rango.value - rango.min) / (rango.max - rango.min)) * 100 : 100
  const mover = (f) => (e) => {
    setAviso(null)
    f(e)
  }

  const confirmar = (t) => {
    const n = leer(t, decimal)
    if (!cancelado.current && n != null) {
      onChange(ajustar(n))
      if (n < min) setAviso(`Escribiste ${format(n)}, pero ${razonMin ?? 'es menos del mínimo permitido'}. Calculamos con ${format(min)}.`)
      else if (n > max) setAviso(`Escribiste ${format(n)}, pero ${razonMax ?? 'es más del máximo permitido'}. Calculamos con ${format(max)}.`)
      else setAviso(null)
    }
    cancelado.current = false
    setBorrador(null)
  }

  return (
    <div className="campo">
      <div className="campo-cab">
        <label htmlFor={id}>{label}</label>
        <input
          className="campo-num"
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          aria-label={`${label} (escribe la cantidad)`}
          value={borrador ?? texto}
          style={{ '--ch': Math.max(3, String(borrador ?? texto).length) }}
          onFocus={(e) => {
            setBorrador(String(Math.round(value * 100) / 100))
            const el = e.currentTarget
            requestAnimationFrame(() => el.select())
          }}
          onChange={(e) => setBorrador(e.target.value)}
          onBlur={(e) => confirmar(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') {
              cancelado.current = true
              e.currentTarget.blur()
            }
          }}
        />
      </div>
      {ayuda && <p className="campo-ayuda">{ayuda}</p>}
      {aviso && <p className="campo-aviso" role="status">{aviso}</p>}
      <input
        type="range"
        className="rango"
        id={id}
        {...rango}
        onChange={mover(rango.onChange)}
        style={{ '--p': pct + '%' }}
        aria-valuetext={texto}
      />
      <div className="campo-ext" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

// Cantidades pequeñas (hijos, padres): menos y más, sin deslizador.
export function Contador({ id, label, ayuda, value, onChange, min, max }) {
  return (
    <div className="campo campo-fila">
      <div>
        <span className="campo-lab" id={id + '-l'}>{label}</span>
        {ayuda && <p className="campo-ayuda">{ayuda}</p>}
      </div>
      <div className="contador" role="group" aria-labelledby={id + '-l'}>
        <button type="button" aria-label="Uno menos" disabled={value <= min} onClick={() => onChange(value - 1)}>
          <Icon name="minus" size={16} strokeWidth={2.2} />
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label="Uno más" disabled={value >= max} onClick={() => onChange(value + 1)}>
          <Icon name="plus" size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

// Sí o no, con su explicación.
export function Interruptor({ id, label, ayuda, checked, onChange }) {
  return (
    <label className="campo campo-fila interruptor" htmlFor={id}>
      <span>
        <span className="campo-lab">{label}</span>
        {ayuda && <span className="campo-ayuda">{ayuda}</span>}
      </span>
      <input type="checkbox" role="switch" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="interruptor-ui" aria-hidden="true" />
    </label>
  )
}
