import Campo from './Campo.jsx'
import Barras from './Barras.jsx'
import GraficaAhorro from './GraficaAhorro.jsx'
import Num from './Num.jsx'
import { Nota, Plastilina, Titulo, VerTabla } from './ui.jsx'
import { money, anios } from '../lib/formato.js'
import { AYUDA } from '../lib/contenido.js'

const pctTexto = (v) => v.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + '%'

export default function Ahorrar({ plan, set, h, k, r, irA }) {
  const mensual = Math.max(0, plan.sm)
  const comparar = [
    { id: '73', nombre: k.opciones[0].nombre, valor: k.opciones[0].p, partes: [['73', k.opciones[0].p]] },
    { id: '97', nombre: 'Ley 97', valor: r.b.p, partes: [['97', r.b.p]] },
    { id: 'plan', nombre: 'Tu plan de ahorro', valor: k.mine, partes: [['verde', k.mine]] },
    { id: '97plan', nombre: 'Ley 97 + tu plan', valor: r.b.p + k.mine, partes: [['97', r.b.p], ['verde', k.mine]] },
  ]

  return (
    <section className="seccion ahorrar" id="ahorrar" aria-labelledby="t-ah">
      <div className="envoltura">
        <div className="cab-con-imagen">
          <Titulo id="t-ah" lead="Si ahorras e inviertes, tus intereses también ganan intereses. Mira qué pasa con el tiempo.">
            El poder del interés compuesto
          </Titulo>
          <span className="tile"><Plastilina nombre="bandera" sizes="200px" /></span>
        </div>

        <div className="sim">
          <div className="tarjeta sim-datos">
            <Campo id="s0" label="¿Cuánto tienes ahorrado hoy?" format={money} min={0} max={5000000} step={10000} curva={2.4} value={plan.s0} onChange={set('s0')} />
            <Campo id="sm" label="¿Cuánto ahorrarías cada mes?" format={(v) => money(v) + ' al mes'} min={0} max={100000} step={500} curva={2.2} value={plan.sm} onChange={set('sm')} />
            <Campo id="rt" label="¿Qué rendimiento anual esperas?" ayuda={AYUDA.rt} format={(v) => pctTexto(v) + ' anual'} min={0} max={20} step={0.5} value={plan.rt} onChange={set('rt')} />
            <Campo id="ys" label="¿Por cuántos años?" format={anios} min={1} max={60} value={plan.ys} onChange={set('ys')} />
            <Campo id="inf" label="Inflación anual esperada" ayuda={AYUDA.inf} format={pctTexto} min={0} max={10} step={0.5} value={plan.inf} onChange={set('inf')} />
            <Campo id="goal" label="¿Cuánto quieres juntar?" format={money} min={100000} max={100000000} step={100000} curva={3} value={plan.goal} onChange={set('goal')} />
          </div>

          <div className="sim-res" aria-live="polite">
            <h3>Al final tendrías</h3>
            <p className="cifra-grande verde"><Num value={h.F} /></p>
            <div className="medidor" aria-hidden="true">
              <span className="seg-gris" style={{ width: (h.F > 0 ? (h.put / h.F) * 100 : 0) + '%' }} />
              <span className="seg-verde" style={{ width: (h.F > 0 ? ((h.F - h.put) / h.F) * 100 : 0) + '%' }} />
            </div>
            <p className="msg">
              De eso, <b>{money(h.put)}</b> los pusiste tú y <b>{money(h.F - h.put)}</b> ({h.pctIntereses}%) son intereses. En pesos de hoy (con inflación) equivaldría a unos <b>{money(h.real)}</b>.
            </p>
            <p className="msg">
              Para juntar {money(plan.goal)} en {anios(h.y)} tendrías que ahorrar{' '}
              {h.need > 0 ? <><b>{money(h.need)}</b> al mes.</> : 'nada más: ya con lo que tienes llegas.'}
            </p>
            {h.w > 0 && (
              <Nota tono="aviso">
                Si esperas 10 años para empezar (y ahorras lo mismo), juntarías {money(h.w)}: pierdes <b>{money(h.F - h.w)}</b>.
              </Nota>
            )}
          </div>
        </div>

        <div className="tarjeta grafica">
          <h3>Cómo crece tu ahorro año con año</h3>
          <p className="grafica-sub">Pasa el cursor o toca una columna para ver cada año.</p>
          <GraficaAhorro porAnio={h.porAnio} />
          <VerTabla
            columnas={['Año', 'Total', 'Lo que pones tú', 'Intereses']}
            filas={h.porAnio.map((a) => ['Año ' + a.anio, money(a.total), money(a.aportado), money(a.intereses)])}
          />
        </div>

        <div className="tarjeta frente" aria-labelledby="t-frente">
          <div className="frente-cab">
            <span className="tile tile-chico"><Plastilina nombre="caja" sizes="96px" /></span>
            <div>
              <h3 id="t-frente">¿Y frente a las leyes?</h3>
              <p className="grafica-sub">
                Retiro a los <b>{k.R}</b> años (dentro de {anios(k.y)}), con el sueldo, el año de inicio y la familia de “Mi pensión”. Montos mensuales en pesos de ese año.
              </p>
            </div>
          </div>
          <Barras filas={comparar} etiqueta="Pensión mensual de cada ley y de tu plan de ahorro" />
          {k.gap > 0 ? (
            <>
              <p className="msg">
                Con la Ley 97 recibirías {money(r.b.p)} al mes y con la Ley 73, {money(r.a.p)}: te faltan <b>{money(k.gap)}</b> al mes.{' '}
                {k.paraIgualar
                  ? <>Para igualar la Ley 73 tendrías que ahorrar <b>{money(k.paraIgualar)}</b> al mes desde hoy hasta tu retiro ({anios(k.y)}), con el rendimiento y el ahorro de hoy que pusiste arriba.</>
                  : 'Con lo que ya tienes ahorrado hoy igualas la Ley 73 sin ahorrar más.'}
              </p>
              <p className="msg msg-suave">Tu plan actual ({money(mensual)} al mes) cubre {money(k.cubre)} de esos {money(k.gap)}.</p>
            </>
          ) : (
            <p className="msg">
              Tu Ley 97 ya paga igual o más que la Ley 73 ({money(-k.gap)} más al mes), así que no necesitas ahorrar para igualarla. Tu plan de ahorro de arriba es un extra.
            </p>
          )}
          {r.a.ap && <Nota tono="aviso">Con tus semanas no alcanzas las 500 de la Ley 73: ese monto es aproximado, calculado con 500 semanas.</Nota>}
          <button type="button" className="btn btn-sec btn-chico" onClick={() => irA('mi-pension')}>Cambiar mis datos de pensión</button>
        </div>
      </div>
    </section>
  )
}
