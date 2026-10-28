import Num from './Num.jsx'
import { money } from '../lib/calc.js'

// Tarjeta de resultado: bloque de color con la pensión mensual como protagonista.
export default function ResultCard({ ley, subtitulo, monto, sinDerecho, esTuLey, tasa, tasaTxt }) {
  return (
    <article className={'rc rc-' + ley + (esTuLey ? ' rc-tu' : '')}>
      <div className="rc-top">
        <span className="rc-ley">Ley {ley}</span>
        {esTuLey && <span className="rc-tag">Tu ley</span>}
      </div>
      <p className="rc-sub">{subtitulo}</p>
      {sinDerecho ? (
        <>
          <div className="rc-n rc-n-no">Sin derecho</div>
          <p className="rc-per">{tasaTxt}</p>
        </>
      ) : (
        <>
          <div className="rc-n"><Num value={monto} format={money} /></div>
          <p className="rc-per">al mes</p>
          <div className="rc-foot">
            <span className="rc-pct">{Math.round(tasa)}%</span>
            <span>{tasaTxt}</span>
          </div>
        </>
      )}
    </article>
  )
}
