import { useEffect, useMemo, useRef, useState } from 'react'
import Slider from './Slider.jsx'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import CrecimientoChart from './CrecimientoChart.jsx'
import Retos from './Retos.jsx'
import { Callout, Eyebrow, Reveal, SectionHeader } from './ui.jsx'
import { money } from '../lib/calc.js'
import { compararInicio, RENDIMIENTO_BASE_PCT, RETRASO_MESES } from '../lib/ahorro.js'

const INICIAL = { modo: 'mensual', aportacion: 1000, saldoInicial: 0, edad: 25, retiro: 65, tasa: RENDIMIENTO_BASE_PCT }
const MODOS = [
  ['mensual', 'Ahorro mensual'],
  ['unica', 'Aportación única'],
]

const pct1 = (v) => v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
const params = (f) => ({ aportacion: f.aportacion, saldoInicial: f.saldoInicial, edad: f.edad, retiro: f.retiro, tasaAnual: f.tasa / 100 })
const anios = (n) => n + (n === 1 ? ' año' : ' años')

// Figura del encabezado: los primeros meses de cada escenario y el efecto al retiro (ejemplo calculado).
function LineaTiempo() {
  const r = useMemo(() => compararInicio(params(INICIAL)), [])
  const meses = ['Hoy', 'Mes 1', 'Mes 2', 'Mes 3', 'Mes 4']
  return (
    <figure className="ah-fig" aria-label="Ejemplo: los primeros meses de cada escenario">
      <figcaption>
        <b>Ejemplo · $1,000 al mes desde los 25</b>
        <small>Aportaciones al final de cada mes</small>
      </figcaption>
      <div className="tl3">
        <div className="tl3-row tl3-head" aria-hidden="true">
          <span />
          {meses.map((m) => <span key={m}>{m}</span>)}
        </div>
        {[['A', 'Empiezo hoy', 0], ['B', 'En 3 meses', RETRASO_MESES]].map(([k, t, ret]) => (
          <div className={'tl3-row tl3-' + k} key={k}>
            <span className="tl3-who"><i />{t}</span>
            {meses.map((m, i) => {
              const aporta = i >= 1 && i > ret
              return <span key={m} className={'tl3-dot' + (i === 0 ? ' z' : aporta ? ' on' : ' off')} title={aporta ? 'Aporta $1,000' : 'Sin aportación'} />
            })}
          </div>
        ))}
      </div>
      <div className="ah-fig-out">
        <div>
          <small>Dejas de aportar</small>
          <b>{money(r.aportacionNoHecha)}</b>
        </div>
        <Icon name="arrow" size={18} />
        <div>
          <small>Diferencia a los 65</small>
          <b className="em">{money(r.dif.absoluta)}</b>
        </div>
      </div>
    </figure>
  )
}

// Tarjeta de un escenario: saldo final y desglose.
function Escenario({ id, titulo, sub, datos }) {
  return (
    <article className={'scn scn-' + id}>
      <header>
        <span className="scn-k">{id}</span>
        <div>
          <b>{titulo}</b>
          <small>{sub}</small>
        </div>
      </header>
      <div className="scn-n"><Num value={datos.final} /></div>
      <dl>
        <div><dt>Total aportado</dt><dd><Num value={datos.aportado} /></dd></div>
        <div><dt>Rendimientos</dt><dd><Num value={datos.rendimientos} /></dd></div>
      </dl>
    </article>
  )
}

export default function Ahorra() {
  const [f, setF] = useState(INICIAL)
  const [anio, setAnio] = useState(null) // null = último año (retiro)
  const [aviso, setAviso] = useState(null)
  const sim = useRef(null)
  const [verMini, setVerMini] = useState(false)

  // En pantallas chicas el resumen fijo aparece solo mientras el simulador está a la vista,
  // para no tapar el encabezado ni los retos.
  useEffect(() => {
    const el = sim.current
    if (!el || typeof IntersectionObserver === 'undefined') return setVerMini(true)
    const io = new IntersectionObserver(([e]) => setVerMini(e.isIntersecting), { rootMargin: '-35% 0px -35% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const set = (k) => (v) =>
    setF((p) => {
      const n = { ...p, [k]: v }
      if (k === 'edad' && n.retiro <= v) n.retiro = Math.min(75, v + 1)
      // La aportación única necesita un monto; si no había saldo, se propone el del reto 2.
      if (k === 'modo' && v === 'unica' && n.saldoInicial < 1000) n.saldoInicial = 10000
      return n
    })

  const r = useMemo(() => compararInicio(params(f), f.modo), [f])
  const unica = r.modo === 'unica'
  const ult = r.anios.hoy.length - 1
  const ai = Math.min(anio ?? ult, ult)
  const vA = r.anios.hoy[ai]
  const vB = r.anios.despues[ai]
  const edadSel = Math.min(f.edad + ai, f.retiro)
  const veces = r.aportacionNoHecha > 0 ? r.dif.absoluta / r.aportacionNoHecha : null

  const irAlSimulador = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sim.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const probar = (p) => {
    setF(p)
    setAnio(null)
    setAviso(p.modo === 'unica' ? 'Datos del reto cargados: aportación única de ' + money(p.saldoInicial) + '.' : 'Datos del reto cargados: ' + money(p.aportacion) + ' al mes desde los ' + p.edad + ' años.')
    irAlSimulador()
  }

  return (
    <div className="ahorra">
      {/* Resumen fijo en pantallas pequeñas */}
      <div className={'mini mini-ah' + (verMini ? ' on' : '')} role="status" aria-label="Resumen del simulador de ahorro" aria-hidden={!verMini}>
        <div className="mini-i mini-A"><small>Empiezo hoy</small><b>{money(r.hoy.final)}</b></div>
        <div className="mini-i mini-B"><small>Costo de esperar</small><b>{money(r.dif.absoluta)}</b></div>
      </div>

      {/* ---------- Encabezado ---------- */}
      <section className="ah-hero">
        <div className="wrap ah-hero-grid">
          <div className="ah-hero-txt">
            <Eyebrow>Ahorra · Interés compuesto</Eyebrow>
            <h1>¿Cuánto te cuesta esperar para ahorrar?</h1>
            <p className="hero-lead">Descubre cómo tres meses pueden cambiar el crecimiento de tu ahorro a largo plazo.</p>
            <p className="ah-hero-note">
              El tiempo también hace crecer tu dinero: los rendimientos de hoy generan nuevos rendimientos mañana.
            </p>
            <div className="actions">
              <button className="btn btn-primary btn-lg" onClick={irAlSimulador}>
                Ir al simulador <Icon name="down" size={18} />
              </button>
            </div>
          </div>
          <LineaTiempo />
        </div>
      </section>

      {/* ---------- Simulador ---------- */}
      <section className="wrap ah-sec" id="simulador-ahorro" ref={sim} aria-labelledby="t-ah-sim" tabIndex={-1}>
        <SectionHeader eyebrow="Simulador" title="Hoy vs. en 3 meses">
          Mismas condiciones y misma fecha de retiro. Lo único que cambia es cuándo empiezas.
        </SectionHeader>
        <h2 id="t-ah-sim" className="sr">Simulador: empezar hoy o en 3 meses</h2>

        <div className="ah-sim">
          <aside className="panel ah-form" aria-label="Datos del simulador de ahorro">
            <div className="panel-h">
              <div>
                <h2>Tus supuestos</h2>
                <p>Se aplican a ambos escenarios.</p>
              </div>
              <button className="icon-btn" onClick={() => { setF(INICIAL); setAnio(null); setAviso(null) }} aria-label="Restablecer valores" title="Restablecer">
                <Icon name="rotate" size={18} />
              </button>
            </div>

            <div className="seg seg-on" role="group" aria-label="Tipo de ahorro">
              {MODOS.map(([id, t]) => (
                <button key={id} className={f.modo === id ? 'on' : ''} aria-pressed={f.modo === id} onClick={() => set('modo')(id)}>
                  {t}
                </button>
              ))}
            </div>

            {aviso && (
              <p className="hint hint-ok ah-aviso" role="status">
                <Icon name="check" size={15} strokeWidth={2.2} />
                <span>{aviso}</span>
              </p>
            )}

            <div className="ah-fields">
              {unica ? (
                <Slider id="ah-unica" label="Monto a invertir" valor={money(f.saldoInicial)} fmt={money}
                  min={1000} max={500000} step={1000} value={Math.max(1000, f.saldoInicial)} onChange={set('saldoInicial')} />
              ) : (
                <>
                  <Slider id="ah-apo" label="Aportación mensual" valor={money(f.aportacion)} fmt={money}
                    min={100} max={20000} step={100} value={f.aportacion} onChange={set('aportacion')} />
                  <Slider id="ah-sal" label="Saldo inicial (opcional)" valor={f.saldoInicial > 0 ? money(f.saldoInicial) : 'Sin saldo'} fmt={money}
                    min={0} max={1000000} step={5000} value={f.saldoInicial} onChange={set('saldoInicial')} />
                </>
              )}
              <Slider id="ah-edad" label="Edad actual" valor={anios(f.edad)} fmt={anios} min={18} max={64} value={f.edad} onChange={set('edad')} />
              <Slider id="ah-ret" label="Edad de retiro" valor={anios(f.retiro)} fmt={anios} min={Math.min(75, f.edad + 1)} max={75} value={f.retiro} onChange={set('retiro')} />
              <Slider id="ah-tasa" label="Rendimiento anual" valor={pct1(f.tasa)} fmt={(v) => v + '%'} min={0} max={15} step={0.5} value={f.tasa} onChange={set('tasa')}
                aviso={f.tasa === RENDIMIENTO_BASE_PCT ? { tono: 'info', texto: 'Mismo rendimiento que usa el simulador de pensiones para la Afore.' } : null} />
            </div>
          </aside>

          <div className="ah-out">
            <div className="ah-key" aria-live="polite">
              <span className="ah-key-tag"><Icon name="clock" size={15} />Costo estimado de esperar 3 meses</span>
              <p className="ah-key-t">
                Esperar 3 meses podría representar <b className="ah-key-n"><Num value={r.dif.absoluta} /></b> menos al llegar al retiro.
              </p>
              <div className="ah-key-meta">
                <span><b>{pct1(r.dif.pct)}</b> menos que empezar hoy</span>
                {veces != null && <span>Dejas de aportar <b>{money(r.aportacionNoHecha)}</b>; al retiro la diferencia es <b>{veces.toFixed(1)} veces</b> esa cantidad</span>}
                <span>{r.p.meses} meses hasta los {f.retiro} años</span>
              </div>
              <small className="ah-key-base">Base del porcentaje: saldo final del escenario A (Empiezo hoy).</small>
            </div>

            <div className="scns">
              <Escenario id="A" titulo="Empiezo hoy" datos={r.hoy}
                sub={unica ? 'Invierte el monto este mes' : `${r.hoy.numAportaciones} aportaciones mensuales`} />
              <Escenario id="B" titulo="Empiezo en 3 meses" datos={r.despues}
                sub={unica ? 'Invierte el monto en el mes 3' : `${r.despues.numAportaciones} aportaciones mensuales`} />
            </div>

            <p className="ah-note">
              <Icon name="info" size={16} />
              {unica
                ? 'Se compara invertir el mismo monto hoy o tres meses después. No hay aportaciones mensuales.'
                : f.saldoInicial > 0
                  ? `El saldo inicial de ${money(f.saldoInicial)} queda invertido desde hoy en ambos escenarios; lo único que se retrasa son las aportaciones mensuales.`
                  : 'Es un saldo acumulado al retiro, no una pensión mensual.'}
            </p>
          </div>
        </div>

        {/* ---------- Gráfica ---------- */}
        <div className="panel ah-chart">
          <div className="panel-h">
            <div>
              <h2>Cómo crece tu ahorro año con año</h2>
              <p>Pasa el cursor o toca la gráfica, o mueve el control para recorrer los años.</p>
            </div>
            <span className="badge-est">Simulación</span>
          </div>

          <CrecimientoChart hoy={r.anios.hoy} despues={r.anios.despues} edad={f.edad} anio={ai} onAnio={setAnio} />

          <div className="ah-year">
            <div className="field">
              <div className="field-top">
                <label htmlFor="ah-anio">Recorre los años</label>
                <output htmlFor="ah-anio" className="val">{edadSel} años</output>
              </div>
              <input type="range" id="ah-anio" min={0} max={ult} step={1} value={ai}
                style={{ '--p': (ult ? (ai / ult) * 100 : 100) + '%' }}
                aria-valuetext={`A los ${edadSel} años`}
                onChange={(e) => setAnio(+e.target.value)} />
            </div>
            <div className="readout ah-readout" aria-live="polite">
              <div><small>Año</small><b>{ai === 0 ? 'Hoy' : '+' + anios(ai)}</b></div>
              <div><small><i style={{ background: 'var(--sA)' }} />Empiezo hoy</small><b>{money(vA)}</b></div>
              <div><small><i style={{ background: 'var(--sB)' }} />En 3 meses</small><b>{money(vB)}</b></div>
              <div><small>Diferencia</small><b>{money(vA - vB)}</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Retos ---------- */}
      <Reveal as="section" className="wrap ah-sec" aria-labelledby="t-retos">
        <div className="sec-head">
          <Eyebrow>Para el público</Eyebrow>
          <h2 id="t-retos">Pon a prueba tu intuición financiera</h2>
          <p>Cuatro retos rápidos. Elige tu respuesta, revela el resultado y compruébalo con tus propios datos.</p>
        </div>
        <Retos onProbar={probar} />
      </Reveal>

      {/* ---------- Relación con las leyes ---------- */}
      <Reveal as="section" className="wrap ah-sec" aria-labelledby="t-rel">
        <div className="sec-head">
          <Eyebrow>Contexto</Eyebrow>
          <h2 id="t-rel">¿Qué tiene que ver el ahorro con tu pensión?</h2>
        </div>
        <div className="rel">
          <article className="rel-i rel-73">
            <span className="rel-tag">Ley 73</span>
            <p>La pensión se determina con las reglas del régimen: salario base de referencia de los últimos años, semanas cotizadas, edad de retiro y otros factores que establece la ley.</p>
          </article>
          <article className="rel-i rel-97">
            <span className="rel-tag">Ley 97</span>
            <p>El saldo acumulado en tu cuenta individual de la Afore es fundamental para financiar la pensión, sujeto a las reglas y modalidades de retiro que correspondan.</p>
          </article>
          <article className="rel-i rel-vol">
            <span className="rel-tag">Ahorro voluntario</span>
            <p>En cualquier régimen, ahorrar por tu cuenta puede complementar los recursos disponibles para el retiro. Entre antes empieces, más tiempo tiene para crecer.</p>
          </article>
        </div>
        <p className="rel-src">
          <Icon name="file" size={16} />
          <span>
            Consulta información oficial en el <a href="https://www.imss.gob.mx" target="_blank" rel="noreferrer">IMSS</a> y la{' '}
            <a href="https://www.gob.mx/consar" target="_blank" rel="noreferrer">CONSAR</a>.
          </span>
        </p>
        <Callout tone="gold" title="Aviso">
          Simulación con fines educativos. Los resultados dependen de los supuestos utilizados y no constituyen asesoría financiera ni una estimación oficial de pensión.
        </Callout>
      </Reveal>
    </div>
  )
}
