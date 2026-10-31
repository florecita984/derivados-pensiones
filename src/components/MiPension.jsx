import { useRef } from 'react'
import Campo, { Contador, Interruptor } from './Campo.jsx'
import GraficaEdades from './GraficaEdades.jsx'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import { Titulo, VerTabla, useVisible } from './ui.jsx'
import { money } from '../lib/formato.js'
import { retiroMinimo, RANGO_SBC } from '../lib/pension.js'
import { AYUDA, SUPUESTOS } from '../lib/contenido.js'

const anios = (v) => v + ' años'

// Resultado de una ley. La que le toca a la persona lleva la marca "Tu ley".
function Ley({ ley, nombre, tu, monto, aprox, detalle }) {
  return (
    <article className={'ley ley-' + ley + (tu ? ' tu' : '')}>
      <header>
        <span className="ley-nombre"><i className={'clave clave-' + ley} />{nombre}</span>
        {tu && <span className="ley-tu"><Icon name="check" size={14} strokeWidth={2.6} />Tu ley</span>}
      </header>
      <p className="ley-monto">
        {aprox && <span aria-label="aproximadamente">≈ </span>}
        <Num value={monto} />
        <small>al mes</small>
      </p>
      <p className="ley-detalle">{detalle}</p>
    </article>
  )
}

export default function MiPension({ caso, set, x11, setX11, r }) {
  const form = useRef(null)
  const res = useRef(null)
  // En móvil, mientras los datos tapan los resultados, una barra fija los resume.
  const formVisible = useVisible(form)
  const resVisible = useVisible(res, '0px 0px -30% 0px')
  const verMini = formVisible && !resVisible

  return (
    <section className="seccion" id="mi-pension" aria-labelledby="t-mi">
      <div className="envoltura">
        <Titulo id="t-mi" lead="Estos datos se usan en toda la página: lo que muevas aquí cambia también el comprobante de arriba y las comparaciones de abajo.">
          Tu pensión, con todos tus datos
        </Titulo>

        <div className="sim">
          <div className="tarjeta sim-datos" ref={form}>
            <fieldset>
              <legend>Tú</legend>
              <Campo id="edad" label="¿Cuántos años tienes?" format={anios} min={15} max={74} value={caso.edad} onChange={set('edad')} />
              <Campo id="sbc" label="Salario base de cotización al mes, el registrado ante el IMSS" ayuda={AYUDA.sbc} format={money} {...RANGO_SBC} value={caso.sbc} onChange={set('sbc')} />
              <Campo id="ini" label="¿En qué año empezaste a trabajar con seguro social (IMSS)?" ayuda={AYUDA.ini} min={1930} max={2026} value={caso.ini} onChange={set('ini')} />
            </fieldset>
            <fieldset>
              <legend>Tu retiro</legend>
              <Campo id="ret" label="¿A qué edad te quieres retirar?" ayuda={AYUDA.ret} format={anios} min={retiroMinimo(caso.edad)} max={75} value={caso.ret} onChange={set('ret')} />
              <Campo
                id="aho"
                label="¿Cuánto dinero tienes ahorrado en tu Afore?"
                ayuda={AYUDA.aho}
                format={money}
                mostrar={caso.aho > 0 ? undefined : 'Lo estimamos'}
                min={0} max={20000000} step={100000} curva={2.4}
                value={caso.aho}
                onChange={set('aho')}
              />
            </fieldset>
            <fieldset>
              <legend>Tu familia</legend>
              <Interruptor id="esp" label="Tengo esposa(o) o pareja que depende de mí" ayuda={AYUDA.esp} checked={caso.esp} onChange={set('esp')} />
              <Contador id="hij" label="Hijos que dependen de ti" ayuda={AYUDA.hij} min={0} max={10} value={caso.hij} onChange={set('hij')} />
              <Contador id="pad" label="Padres que dependen de ti" ayuda={AYUDA.pad} min={0} max={2} value={caso.pad} onChange={set('pad')} />
            </fieldset>
          </div>

          <div className="sim-res" ref={res} aria-live="polite">
            <h3>Tu pensión mensual al retirarte</h3>
            <p className="sim-res-sub">A los {caso.ret} años, en pesos de {r.anioRetiro}.</p>
            <div className="leyes">
              <Ley ley="73" nombre="Ley 73 (la de antes)" tu={r.mi73} monto={r.a.p} aprox={r.a.ap} detalle={r.textos.r73} />
              <Ley ley="97" nombre="Ley 97 (la actual)" tu={!r.mi73} monto={r.b.p} detalle={r.textos.r97} />
            </div>
            <p className="msg">{r.msg}</p>
            {r.avisos.length > 0 && (
              <ul className="avisos">
                {r.avisos.map((a) => (
                  <li key={a}><Icon name="alert" size={16} strokeWidth={2} />{a}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="tarjeta grafica" aria-labelledby="t-edades">
          <h3 id="t-edades">¿Y si me retiro a otra edad?</h3>
          <p className="grafica-sub">Pensión mensual según la edad de retiro, de 60 a 75 años. Toca una edad para elegirla.</p>
          <GraficaEdades filas={r.filas} ret={caso.ret} onRet={set('ret')} />
          <VerTabla columnas={['Edad de retiro', 'Ley 73', 'Ley 97']} filas={r.filas.map(([e, a, b]) => [e + ' años', money(a), money(b)])} />
          <details className="mas">
            <summary>
              <span>Supuestos que usamos</span>
              <Icon name="chevron" size={18} strokeWidth={2} />
            </summary>
            <div className="mas-c">
              <p>{SUPUESTOS}</p>
              <label className="casilla">
                <input type="checkbox" checked={x11} onChange={(e) => setX11(e.target.checked)} />
                <span>Ley 73: sumar 11% a toda la pensión, como en el material de clase (el IMSS lo aplica a la pensión mínima, que ya lo incluye). No cambia la Ley 97.</span>
              </label>
            </div>
          </details>
        </div>
      </div>

      <button type="button" className={'mini' + (verMini ? ' on' : '')} onClick={() => res.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} tabIndex={verMini ? 0 : -1} aria-hidden={!verMini}>
        <span><small><i className="clave clave-73" />Ley 73</small><b>{r.textos.p73}</b></span>
        <span><small><i className="clave clave-97" />Ley 97</small><b>{r.textos.p97}</b></span>
        <span className="mini-ver">Ver <Icon name="down" size={15} strokeWidth={2.2} /></span>
      </button>
    </section>
  )
}
