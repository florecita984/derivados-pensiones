import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Plastilina, Titulo } from './ui.jsx'
import { money, entero } from '../lib/formato.js'
import { P, TOPE, MINIMA_73, asig } from '../lib/pension.js'
import { GLOSARIO, LEY_EN_UNA_FRASE } from '../lib/contenido.js'

// Cada capítulo explica un término y lo aterriza con los números de la persona (r = pensión, h = ahorro).
function capitulos(r, h) {
  const { d, a, b, mi73 } = r
  const ley = mi73 ? '73' : '97'
  return [
    {
      id: 'fecha',
      img: 'calendario',
      titulo: 'Una fecha decide tu ley',
      texto:
        'Si empezaste a cotizar antes del 1 de julio de 1997, te toca la Ley 73. Si empezaste ese día o después, la Ley 97. Usamos la ley de hoy: no podemos pronosticar cambios futuros.',
      dato: `Empezaste en ${d.ini}: te toca la Ley ${ley}.`,
    },
    {
      id: 'ley73',
      img: 'sobre',
      titulo: 'Ley 73: se basa en tu sueldo',
      texto: LEY_EN_UNA_FRASE[73],
      dato: `Con tus datos, la Ley 73 te pagaría ${r.textos.p73} al mes${mi73 ? '' : ', solo como comparación'}.`,
    },
    {
      id: 'ley97',
      img: 'cochinito',
      titulo: 'Ley 97: se basa en tu ahorro',
      texto: `${LEY_EN_UNA_FRASE[97]} Ese ahorro se junta en tu Afore: ${GLOSARIO.afore.charAt(0).toLowerCase()}${GLOSARIO.afore.slice(1)}`,
      dato: `Al retirarte tendrías unos ${money(b.saldo)} en tu Afore (en pesos de ${r.anioRetiro}). Repartidos en tu retiro, dan ${r.textos.p97} al mes.`,
    },
    {
      id: 'semanas',
      img: 'reloj',
      titulo: 'Semanas cotizadas',
      texto: GLOSARIO.semanas,
      dato: `Al retirarte a los ${d.ret} llevarías ${entero(b.sem)} semanas. Ese año la Ley 97 pide ${entero(r.rq)}.`,
    },
    {
      id: 'uma',
      img: 'regla',
      titulo: 'UMA y sueldo base de cotización',
      texto: `${GLOSARIO.uma} Sueldo base de cotización: ${GLOSARIO.sbc.charAt(0).toLowerCase()}${GLOSARIO.sbc.slice(1)}`,
      dato: `Tu sueldo se toma como ${money(d.sbc)} al mes: el IMSS registra entre ${money(P.sm)} y ${money(TOPE)}.`,
    },
    {
      id: 'minima',
      img: 'salvavidas',
      titulo: 'Pensión mínima y pensión garantizada',
      texto: `En la Ley 73 la pensión nunca baja de 1 salario mínimo más 11% del decreto (unos ${money(MINIMA_73)} al mes en 2026). En la Ley 97 existe la pensión garantizada: ${GLOSARIO.garantizada.charAt(0).toLowerCase()}${GLOSARIO.garantizada.slice(1)}`,
      dato:
        r.garantizada
          ? `Con tus datos tu ahorro no alcanza: la Ley 97 te pagaría la garantizada, unos ${money(b.g)} al mes en pesos de ${r.anioRetiro}.`
          : `Tu pensión garantizada sería de unos ${money(b.g)} al mes en pesos de ${r.anioRetiro}; tu ahorro ya da más que eso.`,
    },
    {
      id: 'familia',
      img: 'casa',
      titulo: 'Tu familia cuenta en la Ley 73',
      texto:
        'Si tienes esposa(o) o pareja que depende de ti, suma 15%; cada hijo que depende de ti, 10%. Si no tienes ni esposa(o) ni hijos, cada padre que depende de ti suma 10% (y 10% más si es solo uno). Si no tienes a nadie, la ley da una ayuda asistencial de 15%. Con todo, la pensión no pasa de tu sueldo promedio. En la Ley 97 tu familia no cambia el monto.',
      dato: `Con tus datos, a tu pensión de la Ley 73 se suma ${Math.round(asig(d) * 100)}%.`,
    },
    {
      id: 'interes',
      img: 'planta',
      titulo: 'Interés compuesto',
      texto: GLOSARIO.interes,
      dato: `Con tu plan de “Ahorrar”, de ${money(h.F)} al final, ${money(h.F - h.put)} serían intereses (${h.pctIntereses}%).`,
    },
  ]
}

export default function Capitulos({ r, h }) {
  const lista = capitulos(r, h)
  const [activo, setActivo] = useState(0)
  const nodos = useRef([])

  // Capítulo activo: el que cruza la mitad de la pantalla.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActivo(Number(e.target.dataset.i))),
      { rootMargin: '-50% 0px -50% 0px' },
    )
    nodos.current.forEach((n) => n && io.observe(n))
    return () => io.disconnect()
  }, [])

  const c = lista[activo]

  return (
    <section className="seccion capitulos" id="como-funciona" aria-labelledby="t-como">
      <div className="envoltura">
        <Titulo id="t-como" lead="Las palabras que vas a escuchar al hablar de tu pensión, explicadas con tus propios números.">
          ¿Por qué sale ese número?
        </Titulo>

        <div className="cap-grid">
          <div className="cap-col">
          <span className="cap-riel" aria-hidden="true">
            <m.span animate={{ scaleY: (activo + 1) / lista.length }} transition={{ type: 'spring', stiffness: 120, damping: 24 }} />
          </span>
          <ol className="cap-lista">
            {lista.map((x, i) => (
              <li key={x.id} ref={(n) => (nodos.current[i] = n)} data-i={i} className={'cap' + (i === activo ? ' on' : '')}>
                <span className="cap-mini" aria-hidden="true">
                  <Plastilina nombre={x.img} sizes="96px" />
                </span>
                <h3>{x.titulo}</h3>
                <p>{x.texto}</p>
                <p className="cap-dato">{x.dato}</p>
              </li>
            ))}
          </ol>
          </div>

          <div className="cap-escena" aria-hidden="true">
            <div className="cap-escenario">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={c.id}
                  className="cap-visual"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                >
                  <Plastilina nombre={c.img} sizes="(max-width: 1100px) 40vw, 460px" />
                  <p className="cap-tarjeta">{c.dato}</p>
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
