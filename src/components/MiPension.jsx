import { useMemo, useState } from 'react'
import Slider from './Slider.jsx'
import Chart from './Chart.jsx'
import ResultCard from './ResultCard.jsx'
import Icon from './Icon.jsx'
import { PageHeader, Callout, DiffStrip } from './ui.jsx'
import { calcPension, money, P } from '../lib/calc.js'
import { comparar } from '../lib/comparar.js'
import { MI_CASO, PERSONA_A, PERSONA_B } from '../lib/personas.js'

const EJEMPLOS = [
  ['Mi caso', MI_CASO],
  ['Persona A · 1995', PERSONA_A],
  ['Persona B · 2005', PERSONA_B],
]

const TOPE_UMA = 25 * P.uma

export default function MiPension({ inicial }) {
  const [f, setF] = useState(inicial || MI_CASO)
  const [x11, setX11] = useState(false)
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }))

  const r = useMemo(() => calcPension(f, x11), [f, x11])
  const { a, b, d, mi73 } = r
  const cmp = a.falta ? null : comparar(a.p, b.p)

  // Retroalimentación por campo (solo mensajes; no modifica ningún cálculo).
  const avisoSbc =
    f.sbc > TOPE_UMA
      ? { tono: 'warn', texto: `Supera el tope de 25 UMA (${money(TOPE_UMA)}). En la Ley 97 se cotiza hasta ese límite.` }
      : null
  const avisoIni =
    2026 - f.ini > f.edad - 16
      ? { tono: 'warn', texto: `Con tu edad se consideran cotizaciones desde los 16 años: ${d.anios} años cotizados.` }
      : { tono: 'ok', texto: `Con este año te corresponde la Ley ${mi73 ? '73' : '97'} · ${d.anios} años cotizados.` }
  const avisoRet =
    f.ret < 65 && mi73
      ? { tono: 'info', texto: `En la Ley 73 la pensión se reduce ${(65 - f.ret) * 5}% por retirarte antes de los 65.` }
      : null
  const avisoAho =
    f.aho === 0 ? { tono: 'info', texto: 'Sin dato: el saldo se estima con tu sueldo y tus años cotizados.' } : null

  return (
    <div className="page wrap">
      {/* Resumen fijo para pantallas pequeñas: los resultados siempre a la vista al mover los controles. */}
      <div className="mini" role="status" aria-label="Resumen de pensión mensual">
        <div className="mini-i mini-73"><small>Ley 73</small><b>{a.falta ? 'Sin derecho' : money(a.p)}</b></div>
        <div className="mini-i mini-97"><small>Ley 97</small><b>{money(b.p)}</b></div>
      </div>

      <PageHeader eyebrow="Simulador" title="Compara tu pensión bajo la Ley 73 y la Ley 97">
        Ajusta tus datos y observa cómo cambia el resultado en tiempo real.
      </PageHeader>

      <div className="sim">
        {/* ---------- Formulario ---------- */}
        <aside className="panel form" aria-label="Datos del simulador">
          <div className="panel-h">
            <div>
              <h2>Tus datos</h2>
              <p>Estos valores se aplican a ambos regímenes.</p>
            </div>
            <button className="icon-btn" onClick={() => setF(MI_CASO)} aria-label="Restablecer datos" title="Restablecer">
              <Icon name="rotate" size={18} />
            </button>
          </div>

          <div className="presets" role="group" aria-label="Casos de ejemplo">
            <span className="presets-t">Casos de ejemplo</span>
            <div className="seg">
              {EJEMPLOS.map(([t, v]) => (
                <button key={t} onClick={() => setF(v)}>{t}</button>
              ))}
            </div>
          </div>

          <fieldset className="grp">
            <legend><span className="n">1</span>Sobre ti</legend>
            <Slider id="edad" label="Edad actual" valor={f.edad + ' años'} fmt={(v) => v + ' años'} min={20} max={59} value={f.edad} onChange={set('edad')} />
            <Slider
              id="sbc"
              label="Sueldo mensual"
              valor={money(f.sbc)}
              fmt={money}
              ayuda="El sueldo con el que cotizas en el IMSS, antes de descuentos."
              min={8000} max={120000} step={1000} value={f.sbc} onChange={set('sbc')}
              aviso={avisoSbc}
            />
            <Slider
              id="ini"
              label="Año en que comenzaste a cotizar"
              valor={f.ini}
              ayuda="Este dato decide qué ley te corresponde."
              min={1980} max={2026} value={f.ini} onChange={set('ini')}
              aviso={avisoIni}
            />
          </fieldset>

          <fieldset className="grp">
            <legend><span className="n">2</span>Tu retiro</legend>
            <Slider
              id="ret"
              label="Edad de retiro"
              valor={f.ret + ' años'}
              fmt={(v) => v + ' años'}
              ayuda="Antes de los 65, la Ley 73 reduce 5% la pensión por cada año."
              min={60} max={65} value={f.ret} onChange={set('ret')}
              aviso={avisoRet}
            />
            <Slider
              id="aho"
              label="Ahorro actual en tu Afore"
              valor={f.aho > 0 ? money(f.aho) : 'Por estimar'}
              fmt={money}
              ayuda="Si no lo sabes, déjalo en $0 y lo estimamos."
              min={0} max={3000000} step={50000} value={f.aho} onChange={set('aho')}
              aviso={avisoAho}
            />
            <label className="switch">
              <input type="checkbox" id="par" checked={f.par} onChange={(e) => set('par')(e.target.checked)} />
              <span className="switch-ui" aria-hidden="true" />
              <span className="switch-t">
                <b>Cuento con pareja dependiente</b>
                <small>En la Ley 73 suma 15% a la pensión.</small>
              </span>
            </label>
          </fieldset>
        </aside>

        {/* ---------- Resultados ---------- */}
        <div className="out">
          <section className="panel" aria-labelledby="t-res">
            <div className="panel-h">
              <div>
                <h2 id="t-res">Pensión mensual estimada</h2>
                <p>Con retiro a los {f.ret} años</p>
              </div>
              <span className="badge-est">Estimación</span>
            </div>

            <div className="res-row">
              <ResultCard
                ley="73"
                titulo="Ley 73"
                subtitulo="Se basa en tu salario"
                monto={a.p}
                sinDerecho={a.falta}
                esTuLey={mi73}
                tasa={a.falta ? null : (a.p / a.ult) * 100}
                tasaTxt={a.falta ? r.ratio73 : 'de tu último sueldo'}
                datos={a.falta ? null : [
                  ['Semanas cotizadas al retiro', Math.round(b.sem).toLocaleString('es-MX')],
                  ['Último sueldo estimado', money(a.ult)],
                ]}
              />
              <ResultCard
                ley="97"
                titulo="Ley 97"
                subtitulo="Se basa en tu ahorro"
                monto={b.p}
                esTuLey={!mi73}
                tasa={(b.p / b.ult) * 100}
                tasaTxt="de tu último sueldo"
                datos={[
                  ['Saldo estimado en la Afore', money(b.saldo)],
                  ['Pensión garantizada', money(b.g)],
                ]}
              />
            </div>

            {cmp && <DiffStrip cmp={cmp} />}

            {r.msg && <Callout tone="info">{r.msg}</Callout>}
            {r.adv && <Callout tone="warn" title="Ten en cuenta">{r.adv}</Callout>}

            <Callout tone="gold" title="Cifras estimadas">
              Las cantidades son estimaciones sujetas a supuestos: tu sueldo crece 4.5% al año, la UMA y el salario mínimo 3.5%, y tu Afore rinde 7% anual. Se expresan en pesos del año en que te retiras y no constituyen asesoría financiera.
            </Callout>
          </section>

          <section className="panel" aria-labelledby="t-chart">
            <div className="panel-h">
              <div>
                <h2 id="t-chart">Pensión según la edad de retiro</h2>
                <p>Pasa el cursor o toca un punto para ver el detalle.</p>
              </div>
            </div>
            <Chart rows={r.rows} retiro={f.ret} />
            <details className="more">
              <summary>Supuestos que usamos</summary>
              <p>
                UMA 2026: $3,566.22 al mes. Salario mínimo 2026: $315.04 diarios. Tu sueldo sube 4.5% al año; UMA y salario mínimo, 3.5%; tu Afore rinde 7% anual. Las cifras están en pesos del año en que te retiras, no en pesos de hoy. Es una simulación didáctica, no una asesoría.
              </p>
              <label className="check">
                <input type="checkbox" id="x11" checked={x11} onChange={(e) => setX11(e.target.checked)} />
                <span>Sumar el 11% extra que aparece en el material de clase</span>
              </label>
            </details>
          </section>
        </div>
      </div>
    </div>
  )
}
