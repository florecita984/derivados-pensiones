import { useMemo, useState } from 'react'
import { calcPension, money } from '../lib/calc.js'
import { comparar } from '../lib/comparar.js'
import { MI_CASO, PERSONA_A, PERSONA_B } from '../lib/personas.js'
import Num from './Num.jsx'
import Icon from './Icon.jsx'
import { SplitText, Marquee } from './fx.jsx'
import { Chip, Reveal } from './ui.jsx'

const CINTA = [
  '1 jul 1997 decide tu ley',
  '500 semanas mínimas en la Ley 73',
  '875 semanas mínimas en la Ley 97',
  'Tope de 25 UMA en tu sueldo',
  'Afore con 7% de rendimiento supuesto',
]

const RUTAS = [
  { id: 'simulador', tono: 'blue', icon: 'sliders', t: 'Simulador', d: 'Tu pensión en las dos leyes, lado a lado.' },
  { id: 'ahorra', tono: 'amber', icon: 'trend', t: 'Ahorra', d: '¿Hoy o en 3 meses? Mira lo que cuesta esperar.' },
  { id: 'modalidad-40', tono: 'navy', icon: 'calendar', t: 'Modalidad 40', d: 'Sube tu pensión con las reglas nuevas.' },
]

// Duelo visual del héroe: dos personas con el mismo sueldo, distinta ley (valores del simulador).
function Duelo() {
  const { pa, pb, cmp } = useMemo(() => {
    const pa = calcPension(PERSONA_A, false).a.p
    const pb = calcPension(PERSONA_B, false).b.p
    return { pa, pb, cmp: comparar(pa, pb) }
  }, [])
  const mx = Math.max(pa, pb)
  return (
    <div className="duel" role="img" aria-label={`Pensión mensual: Ley 73 ${money(pa)} contra Ley 97 ${money(pb)}`}>
      <article className="duel-c duel-73">
        <div className="duel-t"><span>Ley 73</span><small>Empezó en 1995</small></div>
        <div className="duel-n"><Num value={pa} desde={0} ms={1100} /></div>
        <div className="duel-bar"><i style={{ width: (pa / mx) * 100 + '%' }} /></div>
      </article>
      <span className="duel-vs" aria-hidden="true">VS</span>
      <article className="duel-c duel-97">
        <div className="duel-t"><span>Ley 97</span><small>Empezó en 2005</small></div>
        <div className="duel-n"><Num value={pb} desde={0} ms={1100} /></div>
        <div className="duel-bar"><i style={{ width: (pb / mx) * 100 + '%' }} /></div>
      </article>
      <span className="duel-chip">{money(cmp.diff)} de diferencia al mes</span>
    </div>
  )
}

// "¿Qué ley te toca?": un solo control y una respuesta enorme.
function QueLey({ ir }) {
  const [anio, setAnio] = useState(2008)
  const es73 = anio <= 1996
  const pct = ((anio - 1980) / (2026 - 1980)) * 100
  return (
    <section className="ley" aria-labelledby="t-ley">
      <div className="ley-in">
        <div className="ley-l">
          <Chip tone="dark">Interactivo</Chip>
          <h2 id="t-ley">¿Qué ley te toca?</h2>
          <label htmlFor="ley-anio" className="ley-lab">Empecé a cotizar en</label>
          <output htmlFor="ley-anio" className="ley-year">{anio}</output>
          <input
            id="ley-anio"
            className="ley-range"
            type="range"
            min={1980}
            max={2026}
            value={anio}
            style={{ '--p': pct + '%' }}
            onChange={(e) => setAnio(+e.target.value)}
          />
          <div className="ley-scale" aria-hidden="true">
            <span>1980</span>
            <span className="ley-mark">1 jul 1997</span>
            <span>2026</span>
          </div>
        </div>

        <div className="ley-r" aria-live="polite">
          <div className={'ley-res ' + (es73 ? 'is73' : 'is97')} key={es73 ? '73' : '97'}>
            <small>Te toca la</small>
            <b>Ley {es73 ? '73' : '97'}</b>
            <p>{es73 ? 'Tu pensión sale de tu salario.' : 'Tu pensión sale de tu ahorro en la Afore.'}</p>
          </div>
          <button className="btn btn-white" onClick={() => ir('simulador', { ...MI_CASO, ini: anio, edad: Math.min(59, Math.max(20, 2026 - anio + 18)) })}>
            Calcular mi pensión
            <Icon name="arrow" size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default function Inicio({ ir }) {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-txt">
            <Chip>IMSS · Ley 73 vs Ley 97</Chip>
            <h1 className="hero-h">
              <SplitText text="Dos leyes. Dos pensiones muy distintas." hl={['distintas.']} />
            </h1>
            <p className="hero-p">Descubre cuál te toca y cuánto podrías recibir.</p>
            <div className="hero-act">
              <button className="btn btn-blue btn-lg" onClick={() => ir('simulador')}>
                Iniciar simulación
                <Icon name="arrow" size={20} strokeWidth={2.4} />
              </button>
              <button className="btn btn-line btn-lg" onClick={() => ir('ahorra')}>Ahorra y compara</button>
            </div>
          </div>
          <Duelo />
        </div>
      </section>

      <Marquee items={CINTA} />

      <div className="wrap">
        <Reveal><QueLey ir={ir} /></Reveal>

        <Reveal as="section" className="rutas" aria-labelledby="t-rutas">
          <h2 id="t-rutas" className="h-sec">Elige por dónde empezar</h2>
          <div className="rutas-grid">
            {RUTAS.map((r) => (
              <button key={r.id} className={'ruta ruta-' + r.tono} onClick={() => ir(r.id)}>
                <span className="ruta-ico"><Icon name={r.icon} size={26} /></span>
                <span className="ruta-t">{r.t}</span>
                <span className="ruta-d">{r.d}</span>
                <span className="ruta-go" aria-hidden="true"><Icon name="arrow" size={22} strokeWidth={2.4} /></span>
              </button>
            ))}
          </div>
          <p className="rutas-more">
            ¿Dudas con los términos? <button onClick={() => ir('aprende')}>Consulta el glosario y las fuentes</button>
          </p>
        </Reveal>
      </div>
    </>
  )
}
