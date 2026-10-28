import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import LeyCards, { LeyTimeline } from './LeyCards.jsx'
import { PageHeader, SectionHeader } from './ui.jsx'
import { FILAS, FUENTES, GLOSARIO } from '../lib/contenido.js'

export default function ComoFunciona() {
  const [q, setQ] = useState('')
  const [abierto, setAbierto] = useState(0)

  const terminos = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? GLOSARIO.filter(([n, d]) => (n + ' ' + d).toLowerCase().includes(t)) : GLOSARIO
  }, [q])

  return (
    <div className="page wrap">
      <PageHeader eyebrow="Aprende" title="Ley 73 vs. Ley 97 en una frase">
        Lo esencial para entender cómo se calcula cada pensión, sin tecnicismos.
      </PageHeader>

      <LeyTimeline />
      <LeyCards definicion />

      <section className="section-s">
        <SectionHeader title="Comparación rápida" />
        <div className="panel tw">
          <table>
            <thead>
              <tr>
                <th><span className="sr">Concepto</span></th>
                <th className="c73">Ley 73</th>
                <th className="c97">Ley 97</th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map(([t, a, b]) => (
                <tr key={t}><th scope="row">{t}</th><td>{a}</td><td>{b}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-s">
        <SectionHeader title="Glosario">Consulta el significado de los términos más usados.</SectionHeader>
        <label className="search">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Buscar un término"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar en el glosario"
          />
        </label>
        <div className="acc">
          {terminos.map(([t, d, icon], i) => {
            const open = q.trim() ? true : abierto === i
            return (
              <div className={'acc-i' + (open ? ' open' : '')} key={t}>
                <button
                  className="acc-b"
                  aria-expanded={open}
                  onClick={() => setAbierto(open && !q.trim() ? -1 : i)}
                >
                  <span className="ico"><Icon name={icon} size={18} /></span>
                  <span>{t}</span>
                  <Icon name="down" size={18} className="chev" />
                </button>
                {open && <p className="acc-p">{d}</p>}
              </div>
            )
          })}
          {terminos.length === 0 && <p className="empty">No encontramos ese término. Prueba con otra palabra.</p>}
        </div>
      </section>

      <section className="section-s">
        <SectionHeader title="Fuentes" />
        <div className="panel src">
          <span className="ico"><Icon name="file" size={20} /></span>
          <p>{FUENTES}</p>
        </div>
      </section>
    </div>
  )
}
