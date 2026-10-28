import Icon from './Icon.jsx'
import { PageHead, Reveal } from './ui.jsx'
import { LEYES, FILAS, FUENTES, GLOSARIO } from '../lib/contenido.js'

export default function ComoFunciona() {
  return (
    <div className="page wrap">
      <PageHead chip="Aprende" title="Ley 73 vs. Ley 97 en una frase" />

      <div className="laws">
        {LEYES.map((l) => (
          <article key={l.id} className={'law law-' + l.id}>
            <span className="law-tag">{l.tag}</span>
            <h2>{l.nombre}</h2>
            <b>{l.lema}</b>
            <p>{l.definicion}</p>
          </article>
        ))}
      </div>

      <Reveal as="section" className="sec" aria-labelledby="t-comp">
        <h2 id="t-comp" className="h-sec">Comparación rápida</h2>
        <div className="card tw">
          <table>
            <thead>
              <tr>
                <th><span className="sr">Concepto</span></th>
                <th className="c73">Ley 73</th>
                <th className="c97">Ley 97</th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map(([t, a, b]) => (
                <tr key={t}><th scope="row">{t}</th><td data-ley="Ley 73">{a}</td><td data-ley="Ley 97">{b}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="sec" aria-labelledby="t-glo">
        <h2 id="t-glo" className="h-sec">Glosario</h2>
        <div className="glo">
          {GLOSARIO.map(([t, d, icon]) => (
            <article className="glo-i" key={t}>
              <span className="glo-ico"><Icon name={icon} size={22} /></span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <details className="more">
        <summary>Fuentes</summary>
        <p>{FUENTES}</p>
      </details>
    </div>
  )
}
