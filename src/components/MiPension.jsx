import { useMemo, useState } from 'react'
import Slider from './Slider.jsx'
import Chart from './Chart.jsx'
import ResultCard from './ResultCard.jsx'
import Icon from './Icon.jsx'
import { PageHead, DiffPill, Alerta } from './ui.jsx'
import { calcPension, money, P } from '../lib/calc.js'
import { comparar } from '../lib/comparar.js'
import { MI_CASO, PERSONA_A, PERSONA_B } from '../lib/personas.js'

const EJEMPLOS = [
  ['Mi caso', MI_CASO],
  ['Persona A', PERSONA_A, 'Empezó a cotizar en 1995'],
  ['Persona B', PERSONA_B, 'Empezó a cotizar en 2005'],
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
      ? { tono: 'warn', texto: `Se consideran cotizaciones desde los 16 años: ${d.anios} años cotizados.` }
      : { tono: 'ok', texto: `Te corresponde la Ley ${mi73 ? '73' : '97'} · ${d.anios} años cotizados.` }
  const avisoRet =
    f.ret < 65 && mi73
      ? { tono: 'info', texto: `En la Ley 73 la pensión baja ${(65 - f.ret) * 5}% por retirarte antes de los 65.` }
      : null
  const avisoAho =
    f.aho === 0 ? { tono: 'info', texto: 'Sin dato: lo estimamos con tu sueldo y tus años cotizados.' } : null

  return (
    <div className="page wrap">
      {/* Resumen fijo para pantallas pequeñas: los resultados siempre a la vista al mover los controles. */}
      <div className="mini" role="status" aria-label="Resumen de pensión mensual">
        <div className="mini-i mini-73"><small>Ley 73</small><b>{a.falta ? 'Sin derecho' : money(a.p)}</b></div>
        <div className="mini-i mini-97"><small>Ley 97</small><b>{money(b.p)}</b></div>
      </div>

      <PageHead chip="Simulador" title="Tu pensión, cara a cara" />

      <div className="sim">
        {/* ---------- Controles ---------- */}
        <aside className="ctrl" aria-label="Datos del simulador">
          <div className="ctrl-h">
            <h2>Tus datos</h2>
            <button className="icon-btn" onClick={() => setF(MI_CASO)} aria-label="Restablecer datos" title="Restablecer">
              <Icon name="rotate" size={18} />
            </button>
          </div>

          <div className="seg" role="group" aria-label="Casos de ejemplo">
            {EJEMPLOS.map(([t, v, tip]) => (
              <button key={t} title={tip} onClick={() => setF(v)}>{t}</button>
            ))}
          </div>

          <fieldset className="grp">
            <legend>Sobre ti</legend>
            <Slider id="edad" label="Edad actual" valor={f.edad + ' años'} min={20} max={59} value={f.edad} onChange={set('edad')} />
            <Slider
              id="sbc"
              label="Sueldo mensual"
              valor={money(f.sbc)}
              ayuda="Antes de descuentos."
              min={8000} max={120000} step={1000} value={f.sbc} onChange={set('sbc')}
              aviso={avisoSbc}
            />
            <Slider
              id="ini"
              label="Año en que empezaste a cotizar"
              valor={f.ini}
              min={1980} max={2026} value={f.ini} onChange={set('ini')}
              aviso={avisoIni}
            />
          </fieldset>

          <fieldset className="grp">
            <legend>Tu retiro</legend>
            <Slider
              id="ret"
              label="Edad de retiro"
              valor={f.ret + ' años'}
              min={60} max={65} value={f.ret} onChange={set('ret')}
              aviso={avisoRet}
            />
            <Slider
              id="aho"
              label="Ahorro en tu Afore"
              valor={f.aho > 0 ? money(f.aho) : 'Por estimar'}
              min={0} max={3000000} step={50000} value={f.aho} onChange={set('aho')}
              aviso={avisoAho}
            />
            <label className="switch">
              <input type="checkbox" id="par" checked={f.par} onChange={(e) => set('par')(e.target.checked)} />
              <span className="switch-ui" aria-hidden="true" />
              <span className="switch-t">
                <b>Pareja dependiente</b>
                <small>Suma 15% en la Ley 73</small>
              </span>
            </label>
          </fieldset>
        </aside>

        {/* ---------- Resultados ---------- */}
        <div className="out">
          <div className="rc-row" aria-label={`Pensión mensual estimada con retiro a los ${f.ret} años`}>
            <ResultCard
              ley="73"
              subtitulo="Se basa en tu salario"
              monto={a.p}
              sinDerecho={a.falta}
              esTuLey={mi73}
              tasa={a.falta ? null : (a.p / a.ult) * 100}
              tasaTxt={a.falta ? r.ratio73 : 'de tu último sueldo'}
            />
            <ResultCard
              ley="97"
              subtitulo="Se basa en tu ahorro"
              monto={b.p}
              esTuLey={!mi73}
              tasa={(b.p / b.ult) * 100}
              tasaTxt="de tu último sueldo"
            />
          </div>

          {cmp && <DiffPill cmp={cmp} />}
          {r.msg && <p className="line-msg">{r.msg}</p>}
          {r.adv && <Alerta>{r.adv}</Alerta>}

          <section className="card" aria-labelledby="t-chart">
            <header className="card-h">
              <h2 id="t-chart">Pensión según la edad de retiro</h2>
              <span className="badge-est">Estimación</span>
            </header>
            <Chart rows={r.rows} retiro={f.ret} />
          </section>

          <details className="more">
            <summary>Detalles y supuestos</summary>
            <dl className="facts">
              <div><dt>Semanas al retiro</dt><dd>{Math.round(b.sem).toLocaleString('es-MX')}</dd></div>
              <div><dt>Último sueldo estimado</dt><dd>{money(a.ult)}</dd></div>
              <div><dt>Saldo estimado en la Afore</dt><dd>{money(b.saldo)}</dd></div>
              <div><dt>Pensión garantizada Ley 97</dt><dd>{money(b.g)}</dd></div>
            </dl>
            <p>
              Tu sueldo sube 4.5% al año; UMA y salario mínimo, 3.5%; tu Afore rinde 7% anual. UMA 2026: $3,566.22 al mes. Salario mínimo 2026: $315.04 diarios. Las cifras están en pesos del año en que te retiras.
            </p>
            <label className="check">
              <input type="checkbox" id="x11" checked={x11} onChange={(e) => setX11(e.target.checked)} />
              <span>Sumar el 11% extra que aparece en el material de clase</span>
            </label>
          </details>

          <p className="est"><Icon name="info" size={15} />Estimaciones sujetas a supuestos. No son asesoría financiera.</p>
        </div>
      </div>
    </div>
  )
}
