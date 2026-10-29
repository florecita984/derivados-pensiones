import { Titulo } from './ui.jsx'
import { AVISO, AVISO_INTRO, FUENTES } from '../lib/contenido.js'

export default function Aviso() {
  return (
    <section className="seccion aviso" id="antes-de-usar" aria-labelledby="t-aviso">
      <div className="envoltura">
        <Titulo id="t-aviso" lead={AVISO_INTRO}>¿Por qué otra calculadora te da otro número?</Titulo>
        <dl className="aviso-lista">
          {AVISO.map(([t, d]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
        <div className="fuentes">
          <h3>Fuentes</h3>
          <ol>
            {FUENTES.map((f) => <li key={f}>{f}</li>)}
          </ol>
        </div>
      </div>
    </section>
  )
}
