import { useEffect, useMemo, useRef, useState } from 'react'
import Slider from './Slider.jsx'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import CrecimientoChart from './CrecimientoChart.jsx'
import Retos from './Retos.jsx'
import { SplitText } from './fx.jsx'
import { Chip, Reveal } from './ui.jsx'
import { money } from '../lib/calc.js'
import { compararInicio, RENDIMIENTO_BASE_PCT } from '../lib/ahorro.js'

const INICIAL = { modo: 'mensual', aportacion: 1000, saldoInicial: 0, edad: 25, retiro: 65, tasa: RENDIMIENTO_BASE_PCT }
const MODOS = [
  ['mensual', 'Ahorro mensual'],
  ['unica', 'Aportación única'],
]

const pct1 = (v) => v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
const params = (f) => ({ aportacion: f.aportacion, saldoInicial: f.saldoInicial, edad: f.edad, retiro: f.retiro, tasaAnual: f.tasa / 100 })
const anios = (n) => n + (n === 1 ? ' año' : ' años')

// Tarjeta de escenario: saldo final y una barra que separa lo aportado de lo que generó el interés.
function Escenario({ id, titulo, sub, datos }) {
  const pa = datos.final > 0 ? (datos.aportado / datos.final) * 100 : 0
  return (
    <article className={'sc sc-' + id}>
      <div className="sc-top">
        <span className="sc-k">{id}</span>
        <div>
          <b>{titulo}</b>
          <small>{sub}</small>
        </div>
      </div>
      <div className="sc-n"><Num value={datos.final} /></div>
      <div className="stack" role="img" aria-label={`Aportado ${money(datos.aportado)}, rendimientos ${money(datos.rendimientos)}`}>
        <i className="stack-a" style={{ width: pa + '%' }} />
        <i className="stack-b" />
      </div>
      <div className="stack-leg">
        <span><i className="d-a" />Aportado <b>{money(datos.aportado)}</b></span>
        <span><i className="d-b" />Intereses <b>{money(datos.rendimientos)}</b></span>
      </div>
    </article>
  )
}

export default function Ahorra() {
  const [f, setF] = useState(INICIAL)
  const [anio, setAnio] = useState(null) // null = último año (retiro)
  const [aviso, setAviso] = useState(null)
  const sim = useRef(null)
  const [verMini, setVerMini] = useState(false)

  // En pantallas chicas el resumen fijo aparece solo mientras el simulador está a la vista.
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
  const ejemplo = useMemo(() => compararInicio(params(INICIAL)), [])
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
    setAviso(p.modo === 'unica' ? 'Reto cargado: aportación única de ' + money(p.saldoInicial) + '.' : 'Reto cargado: ' + money(p.aportacion) + ' al mes desde los ' + p.edad + ' años.')
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
      <section className="hero hero-ah">
        <div className="wrap hero-grid">
          <div className="hero-txt">
            <Chip tone="amber">Ahorra · Interés compuesto</Chip>
            <h1 className="hero-h">
              <SplitText text="¿Cuánto te cuesta esperar?" hl={['esperar?']} />
            </h1>
            <p className="hero-p">Tres meses parecen poco. El interés compuesto opina otra cosa.</p>
            <div className="hero-act">
              <button className="btn btn-ink btn-lg" onClick={irAlSimulador}>
                Probar el simulador
                <Icon name="down" size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="stat" role="img" aria-label={`Ejemplo: esperar 3 meses cuesta ${money(ejemplo.dif.absoluta)} a los 65 años`}>
            <span className="stat-tag">Ejemplo · $1,000 al mes desde los 25</span>
            <p className="stat-l">Esperar 3 meses te quita</p>
            <div className="stat-n"><Num value={ejemplo.dif.absoluta} desde={0} ms={1400} /></div>
            <p className="stat-s">a los 65 años, por dejar de aportar solo <b>{money(ejemplo.aportacionNoHecha)}</b>.</p>
          </div>
        </div>
      </section>

      {/* ---------- Simulador ---------- */}
      <section className="wrap ah-sec" id="simulador-ahorro" ref={sim} aria-labelledby="t-ah-sim" tabIndex={-1}>
        <h2 id="t-ah-sim" className="h-sec">Hoy <span className="vs">vs</span> en 3 meses</h2>

        <div className="sim">
          <aside className="ctrl" aria-label="Datos del simulador de ahorro">
            <div className="ctrl-h">
              <h2>Tus supuestos</h2>
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
              <p className="hint hint-ok" role="status">
                <Icon name="check" size={15} strokeWidth={2.2} />
                <span>{aviso}</span>
              </p>
            )}

            <div className="grp">
              {unica ? (
                <Slider id="ah-unica" label="Monto a invertir" valor={money(f.saldoInicial)}
                  min={1000} max={500000} step={1000} value={Math.max(1000, f.saldoInicial)} onChange={set('saldoInicial')} />
              ) : (
                <>
                  <Slider id="ah-apo" label="Aportación mensual" valor={money(f.aportacion)}
                    min={100} max={20000} step={100} value={f.aportacion} onChange={set('aportacion')} />
                  <Slider id="ah-sal" label="Saldo inicial" valor={f.saldoInicial > 0 ? money(f.saldoInicial) : 'Sin saldo'}
                    min={0} max={1000000} step={5000} value={f.saldoInicial} onChange={set('saldoInicial')} />
                </>
              )}
              <Slider id="ah-edad" label="Edad actual" valor={anios(f.edad)} min={18} max={64} value={f.edad} onChange={set('edad')} />
              <Slider id="ah-ret" label="Edad de retiro" valor={anios(f.retiro)} min={Math.min(75, f.edad + 1)} max={75} value={f.retiro} onChange={set('retiro')} />
              <Slider id="ah-tasa" label="Rendimiento anual" valor={pct1(f.tasa)} min={0} max={15} step={0.5} value={f.tasa} onChange={set('tasa')}
                aviso={f.tasa === RENDIMIENTO_BASE_PCT ? { tono: 'info', texto: 'Igual al rendimiento supuesto para la Afore.' } : null} />
            </div>
          </aside>

          <div className="out">
            <div className="cost" aria-live="polite">
              <span className="cost-tag"><Icon name="clock" size={15} />Costo de esperar 3 meses</span>
              <div className="cost-n"><Num value={r.dif.absoluta} /></div>
              <p className="cost-s">
                <b>{pct1(r.dif.pct)}</b> menos al retiro
                {veces != null && <> · dejas de aportar {money(r.aportacionNoHecha)} y pierdes <b>{veces.toFixed(1)}×</b> esa cantidad</>}
              </p>
            </div>

            <div className="sc-row">
              <Escenario id="A" titulo="Empiezo hoy" datos={r.hoy}
                sub={unica ? 'Invierte este mes' : `${r.hoy.numAportaciones} aportaciones`} />
              <Escenario id="B" titulo="En 3 meses" datos={r.despues}
                sub={unica ? 'Invierte en el mes 3' : `${r.despues.numAportaciones} aportaciones`} />
            </div>

            <section className="card" aria-labelledby="t-ah-chart">
              <header className="card-h">
                <h3 id="t-ah-chart">Así crece tu ahorro</h3>
                <span className="badge-est">Simulación</span>
              </header>

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
                <div className="readout" aria-live="polite">
                  <div><small>Año</small><b>{ai === 0 ? 'Hoy' : '+' + anios(ai)}</b></div>
                  <div><small><i style={{ background: 'var(--sA)' }} />Hoy</small><b>{money(vA)}</b></div>
                  <div><small><i style={{ background: 'var(--sB)' }} />3 meses</small><b>{money(vB)}</b></div>
                  <div><small>Diferencia</small><b>{money(vA - vB)}</b></div>
                </div>
              </div>
            </section>

            <p className="est">
              <Icon name="info" size={15} />
              {unica
                ? 'Mismo monto invertido hoy o tres meses después.'
                : f.saldoInicial > 0
                  ? 'El saldo inicial se invierte desde hoy en ambos casos; solo se retrasan las aportaciones.'
                  : 'Saldo acumulado al retiro, no una pensión mensual. Simulación educativa.'}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Relación con las leyes ---------- */}
      <section className="wrap ah-rel" aria-labelledby="t-rel">
        <Reveal>
          <details className="more more-big">
            <summary id="t-rel">¿Qué tiene que ver el ahorro con tu pensión?</summary>
            <div className="rel">
              <p><b>Ley 73.</b> La pensión sale de las reglas del régimen: sueldo de los últimos años, semanas cotizadas y edad de retiro.</p>
              <p><b>Ley 97.</b> El saldo de tu Afore es clave para financiar la pensión, según las reglas de retiro que correspondan.</p>
              <p><b>Ahorro voluntario.</b> En cualquier régimen puede complementar tu retiro. Entre antes empieces, más tiempo tiene para crecer.</p>
              <p className="rel-src">
                Información oficial: <a href="https://www.imss.gob.mx" target="_blank" rel="noreferrer">IMSS</a> y{' '}
                <a href="https://www.gob.mx/consar" target="_blank" rel="noreferrer">CONSAR</a>. Simulación educativa, no es asesoría financiera.
              </p>
            </div>
          </details>
        </Reveal>
      </section>

      {/* ---------- Retos ---------- */}
      <section className="retos" aria-labelledby="t-retos">
        <div className="wrap">
          <Reveal>
            <Chip tone="dark">Para el público</Chip>
            <h2 id="t-retos" className="h-sec h-sec-w">¿Aciertas?</h2>
            <Retos onProbar={probar} />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
