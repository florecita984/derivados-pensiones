import Icon from './Icon.jsx'
import { LEYES } from '../lib/contenido.js'

// Línea de tiempo que explica cuál ley aplica según la fecha de inicio de cotización.
export function LeyTimeline() {
  return (
    <div className="timeline" role="img" aria-label="Antes del 1 de julio de 1997 aplica la Ley 73; desde esa fecha, la Ley 97">
      <div className="tl-seg tl-73"><b>Ley 73</b><span>Comenzaste a cotizar antes de 1997</span></div>
      <div className="tl-mark"><span>1 jul 1997</span></div>
      <div className="tl-seg tl-97"><b>Ley 97</b><span>Comenzaste a cotizar desde 1997</span></div>
    </div>
  )
}

// Tarjetas descriptivas de cada régimen. con "definicion" muestra además la explicación completa.
export default function LeyCards({ definicion = false }) {
  return (
    <div className="laws">
      {LEYES.map((l) => (
        <article className={'law law-' + l.id} key={l.id}>
          <div className="law-top">
            <span className="law-ico"><Icon name={l.icon} size={22} /></span>
            <span className="law-tag">{l.tag}</span>
          </div>
          <h3>{l.nombre}</h3>
          <p className="law-lema">{l.lema}</p>
          {definicion && <p className="law-def">{l.definicion}</p>}
          <ul>
            {l.puntos.map((p) => (
              <li key={p}><Icon name="check" size={16} strokeWidth={2.6} />{p}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
