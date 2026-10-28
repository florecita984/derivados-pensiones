import { useMemo } from 'react'
import { calcPension, money } from '../lib/calc.js'
import { comparar } from '../lib/comparar.js'
import { area, curva } from '../lib/trazo.js'
import { PERSONA_A, PERSONA_B } from '../lib/personas.js'
import { compararInicio, RENDIMIENTO_BASE } from '../lib/ahorro.js'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import LeyCards, { LeyTimeline } from './LeyCards.jsx'
import { SectionHeader, Eyebrow, Reveal } from './ui.jsx'

const DATOS_CLAVE = [
  { icon: 'calendar', v: '1 jul 1997', t: 'Fecha que define qué ley te corresponde' },
  { icon: 'clock', v: '500 semanas', t: 'Mínimo de cotización en la Ley 73' },
  { icon: 'wallet', v: '875 semanas', t: 'Mínimo en la Ley 97 durante 2026; sube hasta 1,000' },
  { icon: 'landmark', v: '25 UMA', t: 'Tope del sueldo base de cotización' },
]

const PASOS = [
  { icon: 'sliders', t: 'Ingresa tus datos', d: 'Edad, sueldo mensual y año en que comenzaste a cotizar.' },
  { icon: 'scale', t: 'Compara los escenarios', d: 'Consulta la pensión de la Ley 73 y la Ley 97 lado a lado.' },
  { icon: 'chart', t: 'Explora tus resultados', d: 'Cambia la edad de retiro y observa cómo varía la pensión.' },
]

const ACTIVIDADES = [
  {
    icon: 'clock',
    t: '¿Y si te retiras a los 60?',
    d: 'Adelanta el retiro cinco años y compara cuánto disminuye la pensión en cada ley.',
    cta: 'Realizar actividad',
    to: 'simulador',
    preset: { ...PERSONA_A, ret: 60 },
  },
  {
    icon: 'users',
    t: 'Mismo sueldo, distinta ley',
    d: 'Una persona comenzó a cotizar en 1995 y otra en 2005. Anticipa quién recibirá más.',
    cta: 'Comparar personas',
    to: 'simulador',
    preset: PERSONA_A,
  },
  {
    icon: 'target',
    t: '¿Conviene la Modalidad 40?',
    d: 'Calcula cuánto aumenta la pensión al seguir cotizando por cuenta propia.',
    cta: 'Calcular',
    to: 'modalidad-40',
  },
]

const CONCEPTOS = [
  { icon: 'wallet', t: 'Afore', d: 'Cuenta individual de ahorro para el retiro. En la Ley 97 es de donde proviene la pensión.' },
  { icon: 'clock', t: 'Semanas cotizadas', d: 'Semanas en que se pagaron cuotas al IMSS. Se requieren 500 en la Ley 73 y 875 en la Ley 97 durante 2026.' },
  { icon: 'landmark', t: 'UMA', d: 'Unidad de Medida y Actualización: valor de referencia para topes y cuotas. En 2026 equivale a $117.31 diarios.' },
]

// Mini gráfica de líneas del héroe: pensión por edad de retiro de cada persona de ejemplo.
function MiniLineas({ sa, sb }) {
  const W = 440
  const H = 168
  const pl = 14
  const pr = 14
  const pt = 14
  const pb = 30
  const base = H - pb
  const mx = Math.max(...sa.map((r) => r[1]), ...sb.map((r) => r[1])) * 1.12
  const x = (i) => pl + ((W - pl - pr) * i) / (sa.length - 1)
  const y = (v) => base - ((base - pt) * v) / mx
  const pa = sa.map((r, i) => [x(i), y(r[1])])
  const pb2 = sb.map((r, i) => [x(i), y(r[1])])
  const ult = sa.length - 1

  return (
    <svg className="mini-chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Pensión según la edad de retiro, Persona A y Persona B">
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pl} x2={W - pr} y1={base - (base - pt) * t} y2={base - (base - pt) * t} stroke="var(--line)" strokeDasharray={t === 0 ? '0' : '3 5'} />
      ))}
      <path d={area(pa, base)} fill="var(--l73)" opacity=".09" />
      <path d={area(pb2, base)} fill="var(--l97)" opacity=".1" />
      <path className="draw" pathLength="1" d={curva(pa)} fill="none" stroke="var(--l73)" strokeWidth="3" strokeLinecap="round" />
      <path className="draw" pathLength="1" d={curva(pb2)} fill="none" stroke="var(--l97)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={pa[ult][0]} cy={pa[ult][1]} r="5.5" fill="#fff" stroke="var(--l73)" strokeWidth="2.5" />
      <circle cx={pb2[ult][0]} cy={pb2[ult][1]} r="5.5" fill="#fff" stroke="var(--l97)" strokeWidth="2.5" />
      {sa.map((r, i) => (
        <text key={r[0]} x={x(i)} y={H - 9} fontSize="11.5" textAnchor="middle" fill="var(--mu)" fontWeight="500">
          {r[0]}
        </text>
      ))}
    </svg>
  )
}

// Panel comparativo del héroe, calculado con las mismas fórmulas del simulador.
function PanelEjemplo({ ra, rb }) {
  const a = ra[ra.length - 1][1]
  const b = rb[rb.length - 1][1]
  const cmp = comparar(a, b)
  return (
    <aside className="dash" aria-label="Ejemplo comparativo de dos personas">
      <div className="dash-card">
        <div className="dash-h">
          <div>
            <b>Comparativo de ejemplo</b>
            <small>Pensión mensual según la edad de retiro</small>
          </div>
          <span className="badge-est">Estimación</span>
        </div>

        <div className="dash-kpis">
          <div>
            <span className="dash-who"><i className="d73" />Persona A · Ley 73</span>
            <b className="dash-n"><Num value={a} /></b>
            <small>Comenzó a cotizar en 1995</small>
          </div>
          <div>
            <span className="dash-who"><i className="d97" />Persona B · Ley 97</span>
            <b className="dash-n"><Num value={b} /></b>
            <small>Comenzó a cotizar en 2005</small>
          </div>
        </div>

        <MiniLineas sa={ra} sb={rb} />
        <p className="dash-foot">Ambas tienen 45 años y ganan $20,000 al mes. Cifras a los 65 años.</p>
      </div>

      <div className="float" aria-hidden="true">
        <span className="float-i"><Icon name="trend" size={18} /></span>
        <div>
          <small>Diferencia mensual</small>
          <b>+{money(cmp.diff)}</b>
        </div>
      </div>
    </aside>
  )
}

// Presentación de la sección Ahorra con una cifra real calculada con ahorro.js.
function AhorraTeaser({ ir }) {
  const r = useMemo(() => compararInicio({ aportacion: 1000, edad: 25, retiro: 65, tasaAnual: RENDIMIENTO_BASE }), [])
  return (
    <div className="teaser">
      <div className="teaser-txt">
        <Eyebrow>Nuevo · Ahorra</Eyebrow>
        <h2>El tiempo también hace crecer tu dinero</h2>
        <p>Simula cuánto cuesta posponer tu ahorro tres meses y pon a prueba tu intuición con cuatro retos.</p>
        <button className="btn btn-primary" onClick={() => ir('ahorra')}>
          Explorar Ahorra <Icon name="arrow" size={18} />
        </button>
      </div>
      <div className="teaser-fig">
        <dl>
          <div>
            <dt>Dejar de aportar 3 meses</dt>
            <dd>{money(r.aportacionNoHecha)}</dd>
          </div>
          <div className="teaser-em">
            <dt>Diferencia al retiro</dt>
            <dd><Num value={r.dif.absoluta} /></dd>
          </div>
        </dl>
        <p>$1,000 al mes desde los 25 hasta los 65, con rendimiento anual de {Math.round(RENDIMIENTO_BASE * 100)}%.</p>
      </div>
    </div>
  )
}

export default function Inicio({ ir }) {
  // Series por edad de retiro (60 a 65): Persona A en Ley 73 y Persona B en Ley 97.
  const { ra, rb } = useMemo(
    () => ({
      ra: calcPension(PERSONA_A, false).rows.map((r) => [r[0], r[1]]),
      rb: calcPension(PERSONA_B, false).rows.map((r) => [r[0], r[2]]),
    }),
    [],
  )

  return (
    <div className="home">
      {/* ---------- Héroe ---------- */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-txt">
            <Eyebrow>Simulador comparativo · Tema 9</Eyebrow>
            <h1>Compara tu pensión bajo la <span className="t73">Ley 73</span> y la <span className="t97">Ley 97</span></h1>
            <p className="hero-lead">
              Descubre qué ley te corresponde y cuánto podrías recibir al retirarte. Dos personas que trabajan lo mismo
              pueden obtener pensiones muy distintas.
            </p>
            <div className="actions">
              <button className="btn btn-primary btn-lg" onClick={() => ir('simulador')}>
                Iniciar simulación <Icon name="arrow" size={18} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => ir('aprende')}>
                Conocer las diferencias
              </button>
            </div>
            <ul className="trust">
              <li><Icon name="check" size={16} strokeWidth={2.6} />Fórmulas de la Ley del Seguro Social</li>
              <li><Icon name="check" size={16} strokeWidth={2.6} />Fuentes oficiales citadas</li>
              <li><Icon name="check" size={16} strokeWidth={2.6} />Sin registro</li>
            </ul>
          </div>
          <PanelEjemplo ra={ra} rb={rb} />
        </div>
      </section>

      {/* ---------- Datos clave ---------- */}
      <Reveal as="section" className="wrap facts" aria-label="Datos clave">
        {DATOS_CLAVE.map((d) => (
          <div className="fact" key={d.v}>
            <span className="ico"><Icon name={d.icon} size={20} /></span>
            <div>
              <b>{d.v}</b>
              <small>{d.t}</small>
            </div>
          </div>
        ))}
      </Reveal>

      {/* ---------- Cómo funciona ---------- */}
      <Reveal as="section" className="wrap section">
        <SectionHeader eyebrow="Cómo funciona" title="Tres pasos para conocer tu pensión">
          Menos de un minuto, sin registro y sin tecnicismos.
        </SectionHeader>
        <ol className="steps">
          {PASOS.map((p, i) => (
            <li className="step" key={p.t}>
              <div className="step-top">
                <span className="ico ico-lg"><Icon name={p.icon} size={24} /></span>
                <span className="step-n">0{i + 1}</span>
              </div>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </li>
          ))}
        </ol>
        <div className="center">
          <button className="btn btn-primary" onClick={() => ir('simulador')}>Ir al simulador <Icon name="arrow" size={18} /></button>
        </div>
      </Reveal>

      {/* ---------- Qué ley corresponde (sección oscura) ---------- */}
      <section className="band-dark">
        <Reveal className="wrap section">
          <SectionHeader eyebrow="Regímenes" title="¿Qué ley te corresponde?">
            Depende de una sola fecha: el 1 de julio de 1997.
          </SectionHeader>
          <LeyTimeline />
          <LeyCards />
        </Reveal>
      </section>

      {/* ---------- Actividades ---------- */}
      <Reveal as="section" className="wrap section">
        <SectionHeader eyebrow="Para el público" title="Actividades interactivas">
          Elige una, formula tu predicción y compruébala en el simulador.
        </SectionHeader>
        <div className="grid3">
          {ACTIVIDADES.map((r) => (
            <article className="card card-hover act" key={r.t}>
              <span className="ico"><Icon name={r.icon} size={20} /></span>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
              <button className="link" onClick={() => ir(r.to, r.preset)}>
                {r.cta} <Icon name="arrow" size={16} />
              </button>
            </article>
          ))}
        </div>
      </Reveal>

      {/* ---------- Ahorra ---------- */}
      <Reveal as="section" className="wrap section">
        <AhorraTeaser ir={ir} />
      </Reveal>

      {/* ---------- Conceptos ---------- */}
      <Reveal as="section" className="wrap section">
        <SectionHeader eyebrow="Glosario" title="Conceptos clave">
          Tres términos que conviene conocer antes de empezar.
        </SectionHeader>
        <div className="grid3">
          {CONCEPTOS.map((c) => (
            <article className="card concept" key={c.t}>
              <span className="ico"><Icon name={c.icon} size={20} /></span>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </article>
          ))}
        </div>
        <div className="center">
          <button className="link" onClick={() => ir('aprende')}>
            Consultar el glosario completo <Icon name="arrow" size={16} />
          </button>
        </div>
      </Reveal>

      {/* ---------- Cierre ---------- */}
      <Reveal as="section" className="wrap">
        <div className="cta">
          <div>
            <h2>Consulta tu pensión estimada</h2>
            <p>Modifica los controles y el resultado se actualiza al instante.</p>
          </div>
          <button className="btn btn-light btn-lg" onClick={() => ir('simulador')}>
            Iniciar simulación <Icon name="arrow" size={18} />
          </button>
        </div>
      </Reveal>
    </div>
  )
}
