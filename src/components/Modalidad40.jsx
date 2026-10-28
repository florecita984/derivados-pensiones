import { useState } from 'react'
import Slider from './Slider.jsx'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import { PageHead } from './ui.jsx'
import { calcM40, money, P } from '../lib/calc.js'

const COLORES = ['var(--line-2)', 'var(--blue)', 'var(--navy)']
const NOMBRES = ['Sin Modalidad 40', 'Reglas nuevas', 'Reglas anteriores']

export default function Modalidad40() {
  const [f, setF] = useState({ u: 20000, sem: 1000, m: 5 })
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }))
  const { opciones: o, mx } = calcM40(f)
  const ganancia = o[1][1] - o[0][1]

  return (
    <div className="page wrap">
      <PageHead chip="Modalidad 40" title="Paga por tu cuenta, pensiónate con más" />

      <div className="ver">
        <article className="ver-c ver-antes">
          <span className="ver-tag">Antes</span>
          <b>Hasta 25 UMA</b>
          <p>Unos $89,000 al mes y fechas pasadas.</p>
        </article>
        <span className="ver-arrow" aria-hidden="true"><Icon name="arrow" size={26} strokeWidth={2.4} /></span>
        <article className="ver-c ver-ahora">
          <span className="ver-tag">Desde el 22 oct 2026</span>
          <b>Tu último sueldo</b>
          <p>O ese más 1 UMA. Sin fechas pasadas.</p>
        </article>
      </div>

      <div className="sim">
        <aside className="ctrl" aria-label="Datos de Modalidad 40">
          <div className="ctrl-h"><h2>Tu caso</h2></div>
          <div className="grp">
            <Slider id="u" label="Último sueldo mensual" valor={money(f.u)} min={3000} max={80000} step={500} value={f.u} onChange={set('u')}
              aviso={{ tono: 'info', texto: `Con las reglas nuevas te registras con ${money(o[1][2])}.` }} />
            <Slider id="sem" label="Semanas cotizadas" valor={f.sem.toLocaleString('es-MX')} min={500} max={2000} step={25} value={f.sem} onChange={set('sem')} />
            <Slider id="m" label="Años en Modalidad 40" valor={f.m + (f.m === 1 ? ' año' : ' años')} min={1} max={5} value={f.m} onChange={set('m')} />
          </div>
        </aside>

        <div className="out">
          <div className="gain" aria-live="polite">
            <span className="gain-tag">Con las reglas nuevas ganas</span>
            <div className="gain-n">+<Num value={ganancia} /></div>
            <p>
              {ganancia > 0
                ? 'al mes frente a no hacer nada · pensión a los 65, en pesos de hoy'
                : `Tu pensión ya es la mínima garantizada (${money(P.sm)}). Sube el sueldo o las semanas para ver el efecto.`}
            </p>
          </div>

          <section className="card" aria-labelledby="t-m40">
            <header className="card-h">
              <h2 id="t-m40">Pensión mensual por escenario</h2>
              <span className="badge-est">Estimación</span>
            </header>
            <div className="bars">
              {o.map((r, i) => (
                <div className="bar-row" key={r[0]}>
                  <div className="bar-head">
                    <b>{NOMBRES[i]}</b>
                    <span className="bar-n"><Num value={r[1]} /></span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: (r[1] / mx) * 100 + '%', background: COLORES[i] }} />
                  </div>
                  {r[2] ? (
                    <small className="bar-cost">
                      Cuota: {money(r[2] * 0.14438)} al mes · {money(r[2] * 0.14438 * 12 * f.m)} en {f.m} {f.m === 1 ? 'año' : 'años'}
                    </small>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <details className="more">
            <summary>Reglas, avisos y cálculo</summary>
            <p>
              Con las reglas nuevas ganas {money(ganancia)} al mes; con las anteriores habrías ganado {money(o[2][1] - o[0][1])}. Si tu pensión sale igual al salario mínimo ({money(P.sm)}), es la pensión mínima garantizada.
            </p>
            <p>
              <b>Quien ya estaba inscrito</b> antes del 22 de octubre conserva sus condiciones hasta terminar el periodo que contrató. El IMSS revisará en 6 meses si el esquema sigue.
            </p>
            <p>
              Aplica a la Ley 73. Se calcula sobre el promedio de tus últimos 5 años de sueldo (250 semanas). Cuota 2026: 14.438% del sueldo con que te registras (sube hasta 18.80% en 2030). No incluye asignaciones familiares.
            </p>
          </details>

          <p className="est"><Icon name="info" size={15} />Estimaciones sujetas a supuestos. No son asesoría financiera.</p>
        </div>
      </div>
    </div>
  )
}
