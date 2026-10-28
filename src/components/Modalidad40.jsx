import { useState } from 'react'
import Slider from './Slider.jsx'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import { PageHeader, Callout } from './ui.jsx'
import { calcM40, money, P } from '../lib/calc.js'

const COLORES = ['var(--gris)', 'var(--brand)', 'var(--navy)']
const DESCRIPCIONES = [
  'Tu pensión actual si dejas de cotizar.',
  'Reglas vigentes desde el 22 de octubre de 2026.',
  'Reglas anteriores, con hasta 25 UMA.',
]

export default function Modalidad40() {
  const [f, setF] = useState({ u: 5000, sem: 1000, m: 5 })
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }))
  const { opciones: o, mx } = calcM40(f)

  return (
    <div className="page wrap">
      <PageHeader eyebrow="Modalidad 40" title="Reglas anteriores y reglas vigentes">
        Es seguir pagando al IMSS por tu cuenta cuando dejas de trabajar, para juntar semanas y subir tu pensión (aplica a la Ley 73).
        Desde el <b>22 de octubre de 2026</b> las reglas para quien entra nuevo cambiaron.
      </PageHeader>

      <div className="ver">
        <article className="card ver-c ver-antes">
          <span className="ver-tag">Antes</span>
          <p>Podías elegir un sueldo de hasta 25 UMA (unos $89,000 al mes) y hasta registrarte con fechas pasadas.</p>
        </article>
        <span className="ver-arrow" aria-hidden="true"><Icon name="arrow" size={22} /></span>
        <article className="card ver-c ver-ahora">
          <span className="ver-tag">Ahora</span>
          <p>Solo tu último sueldo registrado, o ese más 1 UMA. Sin fechas pasadas y el trámite es digital.</p>
        </article>
      </div>

      <div className="sim">
        <aside className="panel form" aria-label="Datos de Modalidad 40">
          <div className="panel-h">
            <div>
              <h2>Tu caso</h2>
              <p>Pensión a los 65 años, en pesos de hoy.</p>
            </div>
          </div>
          <Slider id="u" label="Último sueldo mensual" valor={money(f.u)} fmt={money} min={3000} max={80000} step={500} value={f.u} onChange={set('u')}
            aviso={{ tono: 'info', texto: `Con las reglas nuevas te registrarías con ${money(o[1][2])} al mes.` }} />
          <Slider id="sem" label="Semanas cotizadas" valor={f.sem.toLocaleString('es-MX') + ' semanas'} fmt={(v) => v.toLocaleString('es-MX')} ayuda="Un año de trabajo son unas 52 semanas." min={500} max={2000} step={25} value={f.sem} onChange={set('sem')} />
          <Slider id="m" label="Años en Modalidad 40" valor={f.m + (f.m === 1 ? ' año' : ' años')} fmt={(v) => v + (v === 1 ? ' año' : ' años')} min={1} max={5} value={f.m} onChange={set('m')} />
        </aside>

        <div className="out">
          <section className="panel" aria-labelledby="t-m40">
            <div className="panel-h">
              <div>
                <h2 id="t-m40">Pensión mensual según el escenario</h2>
                <p>Comparación con la Ley 73 sobre el promedio de tus últimos 5 años.</p>
              </div>
              <span className="badge-est">Estimación</span>
            </div>

            <div className="kpis">
              <div className="kpi kpi-pos">
                <small>Aumento con reglas nuevas</small>
                <b>{money(o[1][1] - o[0][1])}</b>
                <span>al mes frente a no hacer nada</span>
              </div>
              <div className="kpi">
                <small>Cuota mensual</small>
                <b>{money(o[1][2] * 0.14438)}</b>
                <span>con las reglas nuevas</span>
              </div>
              <div className="kpi">
                <small>Inversión total</small>
                <b>{money(o[1][2] * 0.14438 * 12 * f.m)}</b>
                <span>en {f.m} {f.m === 1 ? 'año' : 'años'}</span>
              </div>
            </div>

            <div className="bars">
              {o.map((r, i) => {
                const ganancia = r[1] - o[0][1]
                return (
                  <div className="bar-row" key={r[0]}>
                    <div className="bar-head">
                      <div>
                        <b>{r[0]}</b>
                        <small>{DESCRIPCIONES[i]}</small>
                      </div>
                      <div className="bar-val">
                        <span className="bar-n"><Num value={r[1]} /></span>
                        {i > 0 && (
                          <span className={'delta ' + (ganancia > 0 ? 'delta-pos' : 'delta-neutral')}>
                            {ganancia > 0 && <Icon name="up" size={13} strokeWidth={2.6} />}
                            {money(ganancia)} al mes
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: (r[1] / mx) * 100 + '%', background: COLORES[i] }} />
                    </div>
                    {r[2] ? (
                      <small className="bar-cost">
                        Pagarías {money(r[2] * 0.14438)} al mes ({money(r[2] * 0.14438 * 12 * f.m)} en total)
                      </small>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <Callout tone="info">
              Con las reglas nuevas ganas {money(o[1][1] - o[0][1])} al mes frente a no hacer nada; con las de antes habrías ganado {money(o[2][1] - o[0][1])}. Si tu pensión sale igual al salario mínimo ({money(P.sm)}), es porque esa es la pensión mínima garantizada.
            </Callout>
            <Callout tone="warn" title="Quienes ya estaban inscritos">
              Quien ya estaba inscrito antes del 22 de octubre conserva sus condiciones hasta terminar el periodo que contrató. El IMSS revisará en 6 meses si el esquema sigue.
            </Callout>
            <Callout tone="gold" title="Cifras estimadas">
              Los montos son estimaciones sujetas a supuestos y no constituyen asesoría financiera.
            </Callout>

            <details className="more">
              <summary>Cómo calculamos esto</summary>
              <p>
                Pensión a los 65 años, en pesos de hoy, con la fórmula de la Ley 73 sobre el promedio de tus últimos 5 años de sueldo (250 semanas). Nunca baja de 1 salario mínimo (pensión mínima garantizada). Cuota mensual 2026: 14.438% del sueldo con que te registras (sube hasta 18.80% en 2030). No incluimos asignaciones familiares.
              </p>
            </details>
          </section>
        </div>
      </div>
    </div>
  )
}
