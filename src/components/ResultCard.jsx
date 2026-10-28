import Num from './Num.jsx'
import Icon from './Icon.jsx'
import Ring from './Ring.jsx'
import { LeyBadge } from './ui.jsx'

// Tarjeta de resultado de un régimen (Ley 73 o Ley 97).
// tasa = porcentaje del último sueldo que representa la pensión (solo visual).
export default function ResultCard({ ley, titulo, subtitulo, monto, sinDerecho, esTuLey, tasa, tasaTxt, datos }) {
  return (
    <article className={'res res-' + ley + (esTuLey ? ' tu' : '')}>
      <div className="res-top">
        <LeyBadge ley={ley} />
        {esTuLey && (
          <span className="tu-tag"><Icon name="check" size={12} strokeWidth={3} />Tu ley</span>
        )}
      </div>
      <h3>{titulo}</h3>
      <p className="res-sub">{subtitulo}</p>

      <div className="res-main">
        <div>
          <div className="res-amount">
            {sinDerecho ? <span className="res-none">Sin derecho</span> : <Num value={monto} />}
          </div>
          {!sinDerecho && <small className="res-per">al mes</small>}
        </div>
        {tasa != null && <Ring value={tasa} color={`var(--l${ley})`} label="de tu último sueldo" />}
      </div>
      <p className="res-rate">{tasa != null ? 'Equivale a ' + Math.round(tasa) + '% ' + tasaTxt : tasaTxt}</p>

      {datos && (
        <dl className="res-data">
          {datos.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      )}
    </article>
  )
}
