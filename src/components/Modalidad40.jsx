import Campo from './Campo.jsx'
import Barras from './Barras.jsx'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import { Nota, Plastilina, Titulo } from './ui.jsx'
import { money, anios, entero } from '../lib/formato.js'
import { AYUDA, M40_TEXTOS } from '../lib/contenido.js'

const CLASE = { sin: 'gris', ahora: '73', antes: '73c' }

export default function Modalidad40({ m40, set, res }) {
  const filas = res.opciones.map((o) => ({
    id: o.id,
    nombre: o.nombre,
    valor: o.p,
    partes: [[CLASE[o.id], o.p]],
    sub: o.sbc ? `Pagarías ${money(o.cuota)} al mes (${money(o.total)} en total)` : null,
  }))

  return (
    <section className="seccion m40" id="modalidad-40" aria-labelledby="t-m40">
      <div className="envoltura">
        <div className="cab-con-imagen">
          <Titulo id="t-m40" lead={M40_TEXTOS.intro}>Modalidad 40: sigue cotizando por tu cuenta</Titulo>
          <span className="tile"><Plastilina nombre="recibo" sizes="200px" /></span>
        </div>

        <div className="cambio">
          <p className="cambio-fecha"><Icon name="calendar" size={18} />Desde el 22 de octubre de 2026 las reglas para quien entra nuevo cambiaron.</p>
          <div className="cambio-par">
            <article className="cambio-c antes">
              <h3>Antes</h3>
              <p>{M40_TEXTOS.antes}</p>
            </article>
            <article className="cambio-c ahora">
              <h3>Ahora</h3>
              <p>{M40_TEXTOS.ahora}</p>
            </article>
          </div>
        </div>

        <div className="sim">
          <div className="tarjeta sim-datos">
            <Campo id="u" label="¿Cuál fue tu último sueldo al mes?" ayuda={AYUDA.u} format={money} min={1} max={500000} step={500} curva={2.6} value={m40.ur} onChange={set('ur')} />
            <Campo
              id="sem"
              label="¿Cuántas semanas llevas cotizadas?"
              ayuda={`Equivalen a unos ${(m40.sem / 52).toFixed(1)} años. ${AYUDA.sem}`}
              format={(v) => entero(v) + ' sem'}
              min={52} max={2600} step={13}
              value={m40.sem}
              onChange={set('sem')}
            />
            <Campo id="m" label="¿Cuántos años pagarías en Modalidad 40?" ayuda={AYUDA.m} format={anios} min={1} max={10} value={m40.m} onChange={set('m')} />
          </div>

          <div className="sim-res" aria-live="polite">
            <h3>Tu pensión a los 65 años</h3>
            <p className="sim-res-sub">Al mes y en pesos de hoy, con la fórmula de la Ley 73.</p>
            {!res.aprox && res.gana > 0 && (
              <p className="cifra-grande">
                <span className="cifra-grande-l">Con las reglas nuevas ganas</span>
                +<Num value={res.gana} /> <small>al mes</small>
              </p>
            )}
            <Barras filas={filas} etiqueta="Pensión mensual en cada escenario de Modalidad 40" />
            <p className="msg">{res.msg}</p>
            <Nota tono="aviso">{M40_TEXTOS.inscritos}</Nota>
            <details className="mas">
              <summary>
                <span>Cómo calculamos esto</span>
                <Icon name="chevron" size={18} strokeWidth={2} />
              </summary>
              <div className="mas-c"><p>{M40_TEXTOS.como}</p></div>
            </details>
          </div>
        </div>
      </div>
    </section>
  )
}
