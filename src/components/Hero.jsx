import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import Campo from './Campo.jsx'
import Num from './Num.jsx'
import { Plastilina } from './ui.jsx'
import { money } from '../lib/formato.js'
import { AYUDA } from '../lib/contenido.js'
import { RANGO_SBC } from '../lib/pension.js'

const EASE = [0.16, 1, 0.3, 1]

// Las tres cifras de la frase y cómo se editan (mismos rangos que el simulador completo).
const CIFRAS = {
  edad: { etiqueta: '¿Cuántos años tienes?', min: 15, max: 74, format: (v) => v + ' años' },
  sbc: { etiqueta: 'Salario base de cotización al mes, el registrado ante el IMSS', ...RANGO_SBC, format: money, ayuda: AYUDA.sbc },
  ini: { etiqueta: '¿En qué año empezaste a trabajar con seguro social (IMSS)?', min: 1930, max: 2026, format: String, ayuda: AYUDA.ini },
}

// Comprobante de pensión: el resultado como un recibo, con el sello de la ley que te toca.
function Comprobante({ r, onAfinar }) {
  const reduce = useReducedMotion()
  const ley = r.mi73 ? '73' : '97'
  const monto = r.mi73 ? r.a.p : r.b.p
  const primera = useRef(true)
  useEffect(() => {
    primera.current = false
  }, [])

  return (
    <m.div
      className={'comp comp-' + ley}
      initial={reduce ? false : { clipPath: 'inset(0 0 100% 0 round 18px)', y: -28 }}
      animate={{ clipPath: 'inset(0 0 0% 0 round 18px)', y: 0 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
      aria-live="polite"
    >
      <div className="comp-cab">
        <div>
          <p className="comp-tit">Pensión estimada</p>
          <p className="comp-quien">Al retirarte a los {r.d.ret}, en pesos de {r.anioRetiro}</p>
        </div>
        <AnimatePresence mode="popLayout" initial={!reduce}>
          <m.span
            key={ley}
            className={'sello sello-' + ley}
            initial={{ scale: 1.9, rotate: -22, opacity: 0 }}
            animate={{ scale: 1, rotate: -9, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 560, damping: 20, delay: primera.current ? 1.2 : 0 }}
          >
            Ley {ley}
          </m.span>
        </AnimatePresence>
      </div>

      <p className="comp-monto">
        {r.mi73 && r.a.ap && <span aria-label="aproximadamente">≈ </span>}
        <Num value={monto} desde={0} ms={1500} />
        <small>al mes</small>
      </p>
      <p className="comp-tasa">{r.mi73 ? r.textos.r73 : r.textos.r97}</p>

      <div className="comp-corte" aria-hidden="true" />

      <dl className="comp-leyes">
        <div className={r.mi73 ? 'tu' : ''}>
          <dt><i className="clave clave-73" />Ley 73 (la de antes)</dt>
          <dd>{r.textos.p73}</dd>
        </div>
        <div className={r.mi73 ? '' : 'tu'}>
          <dt><i className="clave clave-97" />Ley 97 (la actual)</dt>
          <dd>{r.textos.p97}</dd>
        </div>
      </dl>
      <p className="comp-nota">La Ley 73 pagaría {r.veces.toFixed(1)} veces lo de la Ley 97.</p>
      {/* Edad y año de inicio que no cuadran: el mismo aviso de la referencia. */}
      {2026 - r.d.ini > r.d.edad - 15 && (
        <p className="comp-aviso">Ajustamos tus años cotizados: no se empieza a cotizar antes de los 15 años.</p>
      )}
      <button type="button" className="btn btn-primario comp-btn" onClick={onAfinar}>
        Afinar mi cálculo
      </button>
    </m.div>
  )
}

export default function Hero({ caso, set, r, irA }) {
  const reduce = useReducedMotion()
  const [editando, setEditando] = useState(null)
  const editor = useRef(null)

  // Escape cierra el editor y devuelve el foco a la cifra.
  useEffect(() => {
    if (!editando) return
    const alTeclear = (e) => {
      if (e.key !== 'Escape') return
      document.getElementById('cifra-' + editando)?.focus()
      setEditando(null)
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [editando])

  const cifra = (k) => (
    <button
      type="button"
      id={'cifra-' + k}
      className={'cifra' + (editando === k ? ' on' : '')}
      aria-expanded={editando === k}
      aria-controls="editor-frase"
      onClick={() => setEditando((e) => (e === k ? null : k))}
    >
      {CIFRAS[k].format(caso[k])}
    </button>
  )

  const c = editando && CIFRAS[editando]
  const entrada = (delay) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE, delay } })

  return (
    <section className="hero" id="inicio" aria-labelledby="t-hero">
      <div className="hero-fondo" aria-hidden="true" />
      <div className="envoltura hero-grid">
        <div className="hero-texto">
          <m.h1 id="t-hero" {...entrada(0)}>¿Cuánto me van a pagar de pensión?</m.h1>
          <m.p className="hero-lead" {...entrada(0.08)}>
            Mueve los controles y mira qué cambia. Sin tecnicismos: te vamos explicando cada término.
          </m.p>

          <m.div {...entrada(0.16)}>
            <p className="frase">
              Tengo {cifra('edad')}, gano {cifra('sbc')} al mes y empecé a trabajar con seguro social en {cifra('ini')}.
            </p>
            <p className="frase-pista">Toca las cifras subrayadas para cambiarlas.</p>
          </m.div>

          <AnimatePresence initial={false}>
            {c && (
              <m.div
                key="editor"
                id="editor-frase"
                ref={editor}
                className="editor"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <div className="editor-in">
                  <Campo
                    id={'hero-' + editando}
                    label={c.etiqueta}
                    ayuda={c.ayuda}
                    value={caso[editando]}
                    onChange={set(editando)}
                    min={c.min}
                    max={c.max}
                    step={c.step}
                    curva={c.curva}
                    razonMin={c.razonMin}
                    razonMax={c.razonMax}
                    format={c.format}
                  />
                  <button type="button" className="btn btn-sec btn-chico" onClick={() => setEditando(null)}>Listo</button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hero-escena">
          <div className="escenario" aria-hidden="true" />
          <Plastilina nombre="mecedora" prioridad sizes="(max-width: 900px) 60vw, 420px" className="hero-mecedora" />
          <Comprobante r={r} onAfinar={() => irA('mi-pension')} />
        </div>

        {/* En escritorio van bajo la frase; en móvil, después del comprobante (ver .hero-grid). */}
        <m.div className="hero-acc" {...entrada(0.24)}>
          <button type="button" className="btn btn-primario" onClick={() => irA('mi-pension')}>Ver mi cálculo completo</button>
          <button type="button" className="btn btn-sec" onClick={() => irA('como-funciona')}>¿Cómo se calcula?</button>
        </m.div>
      </div>
    </section>
  )
}
