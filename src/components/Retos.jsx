import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import Num from './Num.jsx'
import { RETOS } from '../lib/retos.js'

// Juego de cuatro retos: elegir, revelar, ver el cálculo y avanzar. onProbar(params) carga el simulador.
export default function Retos({ onProbar }) {
  const [idx, setIdx] = useState(0)
  const [eleccion, setEleccion] = useState(null)
  const [revelado, setRevelado] = useState(false)
  const [marcas, setMarcas] = useState([]) // true/false por reto respondido
  const terminado = idx >= RETOS.length

  const reto = RETOS[Math.min(idx, RETOS.length - 1)]
  const res = useMemo(() => reto.resolver(), [reto])
  const aciertos = marcas.filter(Boolean).length
  const mx = Math.max(...res.barras.map((b) => b.valor), 1)

  const revelar = () => {
    if (!eleccion || revelado) return
    setRevelado(true)
    setMarcas((m) => [...m, eleccion === res.correcta])
  }
  const siguiente = () => {
    setIdx((i) => i + 1)
    setEleccion(null)
    setRevelado(false)
  }
  const reiniciar = () => {
    setIdx(0)
    setEleccion(null)
    setRevelado(false)
    setMarcas([])
  }

  return (
    <div className="quiz">
      <div className="quiz-bar">
        <ol className="quiz-steps" aria-label="Progreso de los retos">
          {RETOS.map((r, i) => {
            const estado = i < marcas.length ? (marcas[i] ? 'ok' : 'no') : i === idx ? 'on' : ''
            return (
              <li key={r.id} className={estado} aria-current={i === idx ? 'step' : undefined}>
                <span className="sr">Reto {i + 1}{estado === 'ok' ? ', correcto' : estado === 'no' ? ', incorrecto' : ''}</span>
              </li>
            )
          })}
        </ol>
        <span className="quiz-score" aria-live="polite">
          <Icon name="target" size={16} />
          {aciertos} / {RETOS.length}
        </span>
        <button className="icon-btn icon-btn-l" onClick={reiniciar} aria-label="Reiniciar retos" title="Reiniciar retos">
          <Icon name="rotate" size={17} />
        </button>
      </div>

      {terminado ? (
        <div className="quiz-end" key="fin">
          <span className="quiz-end-n">{aciertos}<small>/{RETOS.length}</small></span>
          <div>
            <h3>{aciertos === RETOS.length ? 'Intuición impecable' : aciertos >= 2 ? 'Buen instinto' : 'El tiempo sorprende a casi todos'}</h3>
            <p>Lo que une los cuatro retos: el dinero que entra antes tiene más tiempo para ganar intereses sobre intereses.</p>
            <button className="btn btn-blue" onClick={reiniciar}><Icon name="rotate" size={17} />Jugar de nuevo</button>
          </div>
        </div>
      ) : (
        <div className="quiz-body" key={reto.id}>
          <span className="quiz-n">Reto {idx + 1} · {reto.titulo}</span>
          <h3 className="quiz-q">{reto.pregunta}</h3>
          <ul className="chips">
            {reto.datos.map(([k, v]) => (
              <li key={k}><small>{k}</small><b>{v}</b></li>
            ))}
          </ul>

          <div className={'opts opts-' + reto.opciones.length} role="group" aria-label="Opciones de respuesta">
            {reto.opciones.map((o, i) => {
              const sel = eleccion === o.id
              const cls = revelado ? (o.id === res.correcta ? ' good' : sel ? ' bad' : ' dim') : sel ? ' sel' : ''
              return (
                <button key={o.id} aria-pressed={sel} className={'opt' + cls} disabled={revelado} onClick={() => setEleccion(o.id)}>
                  <span className="opt-k">{String.fromCharCode(65 + i)}</span>
                  <span className="opt-t">{o.texto}</span>
                  {revelado && o.id === res.correcta && <Icon name="check" size={20} strokeWidth={2.8} />}
                  {revelado && sel && o.id !== res.correcta && <Icon name="x" size={20} strokeWidth={2.6} />}
                </button>
              )
            })}
          </div>

          {!revelado ? (
            <div className="quiz-act">
              <button className="btn btn-ink" onClick={revelar} disabled={!eleccion}>
                Revelar resultado
              </button>
            </div>
          ) : (
            <div className="quiz-res" aria-live="polite">
              <p className={'quiz-verdict ' + (eleccion === res.correcta ? 'ok' : 'no')}>
                <Icon name={eleccion === res.correcta ? 'check' : 'info'} size={20} strokeWidth={2.6} />
                {eleccion === res.correcta ? '¡Correcto!' : 'No exactamente'}
              </p>
              <div className="quiz-bars">
                {res.barras.map((b) => (
                  <div className="qb" key={b.nombre}>
                    <div className="qb-h"><span>{b.nombre}</span><b><Num value={b.valor} desde={0} ms={900} /></b></div>
                    <div className="qb-t"><div className="qb-f" style={{ '--w': (b.valor / mx) * 100 + '%', background: b.color }} /></div>
                  </div>
                ))}
              </div>
              <p className="quiz-exp">{res.explicacion}</p>
              <div className="quiz-act">
                <button className="btn btn-blue" onClick={siguiente}>
                  {idx === RETOS.length - 1 ? 'Ver mi resultado' : 'Siguiente reto'} <Icon name="arrow" size={17} />
                </button>
                <button className="btn btn-line" onClick={() => onProbar(reto.probar)}>
                  <Icon name="sliders" size={17} />Probar con mis datos
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
