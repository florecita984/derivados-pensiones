import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { PLASTILINA } from '../assets/plastilina/index.js'

// true mientras el elemento está (al menos en parte) dentro de la franja indicada de la pantalla.
export function useVisible(ref, rootMargin = '0px') {
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return v
}

// Ancho real de un contenedor, para dibujar las gráficas SVG a escala 1:1 (texto legible en móvil).
// estable = ya hubo una medición real; antes de eso las gráficas no animan su geometría.
export function useAncho(ref, inicial = 640) {
  const [w, setW] = useState(inicial)
  const [estable, setEstable] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let raf
    const ro = new ResizeObserver(([e]) => {
      const ancho = Math.round(e.contentRect.width)
      if (ancho > 0) {
        setW(Math.max(260, ancho))
        raf = requestAnimationFrame(() => setEstable(true))
      }
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [ref])
  return [w, estable]
}

// Miniatura de plastilina. Su fondo celeste es el mismo del recuadro, y el borde se desvanece
// para que no se note el cuadro de la imagen.
export function Plastilina({ nombre, sizes = '320px', prioridad = false, className = '' }) {
  const img = PLASTILINA[nombre]
  return (
    <img
      className={'plast ' + className}
      src={img.l}
      srcSet={`${img.s} 320w, ${img.l} 640w`}
      sizes={sizes}
      width="640"
      height="640"
      alt={img.alt}
      loading={prioridad ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

const ICONO_NOTA = { info: 'info', aviso: 'alert', ok: 'check' }

// Mensaje breve junto a un resultado: info (neutro), aviso (algo que conviene saber) u ok.
export function Nota({ tono = 'info', children, className = '' }) {
  return (
    <div className={`nota nota-${tono} ${className}`}>
      <Icon name={ICONO_NOTA[tono]} size={18} strokeWidth={2} />
      <div>{children}</div>
    </div>
  )
}

// Título de sección: una pregunta llana y, si hace falta, una línea que la explica.
export function Titulo({ id, children, lead }) {
  return (
    <header className="titulo">
      <h2 id={id}>{children}</h2>
      {lead && <p>{lead}</p>}
    </header>
  )
}

// Cada gráfica tiene su tabla: los valores se pueden leer sin pasar el cursor.
export function VerTabla({ resumen = 'Ver los datos en una tabla', columnas, filas }) {
  return (
    <details className="ver-tabla">
      <summary>
        <span>{resumen}</span>
        <Icon name="chevron" size={18} strokeWidth={2} />
      </summary>
      <div className="ver-tabla-c">
        <table>
          <thead>
            <tr>{columnas.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f[0]}>{f.map((v, i) => (i === 0 ? <th key={i} scope="row">{v}</th> : <td key={i}>{v}</td>))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
