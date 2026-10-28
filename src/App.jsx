import { useCallback, useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Inicio from './components/Inicio.jsx'
import MiPension from './components/MiPension.jsx'
import Modalidad40 from './components/Modalidad40.jsx'
import ComoFunciona from './components/ComoFunciona.jsx'

const VISTAS = [
  { id: 'inicio', texto: 'Inicio' },
  { id: 'simulador', texto: 'Simulador' },
  { id: 'modalidad-40', texto: 'Modalidad 40' },
  { id: 'aprende', texto: 'Aprende' },
]

const desdeHash = () => {
  const id = window.location.hash.replace(/^#\/?/, '')
  return VISTAS.some((v) => v.id === id) ? id : 'inicio'
}

export default function App() {
  const [vista, setVista] = useState(desdeHash)
  // Al venir de una actividad, el simulador se reinicia con los datos de esa actividad.
  const [reto, setReto] = useState({ key: 0, datos: undefined })

  const ir = useCallback((id, datos) => {
    if (datos) setReto((r) => ({ key: r.key + 1, datos }))
    setVista(id)
    window.history.pushState(null, '', '#/' + (id === 'inicio' ? '' : id))
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const alCambiar = () => {
      setVista(desdeHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', alCambiar)
    window.addEventListener('hashchange', alCambiar)
    return () => {
      window.removeEventListener('popstate', alCambiar)
      window.removeEventListener('hashchange', alCambiar)
    }
  }, [])

  useEffect(() => {
    const t = VISTAS.find((v) => v.id === vista)
    document.title = (vista === 'inicio' ? '' : t.texto + ' · ') + 'Pensiones IMSS · Ley 73 vs Ley 97'
  }, [vista])

  // Las vistas se quedan montadas para no perder lo que el usuario movió en el simulador.
  return (
    <>
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <Navbar vistas={VISTAS} vista={vista} ir={ir} />

      <main className="main" id="contenido">
        <div hidden={vista !== 'inicio'}><Inicio ir={ir} /></div>
        <div hidden={vista !== 'simulador'}><MiPension key={reto.key} inicial={reto.datos} /></div>
        <div hidden={vista !== 'modalidad-40'}><Modalidad40 /></div>
        <div hidden={vista !== 'aprende'}><ComoFunciona /></div>
      </main>

      <Footer vistas={VISTAS} ir={ir} />
    </>
  )
}
