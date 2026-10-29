import { Logo, SECCIONES } from './Nav.jsx'
import { Plastilina } from './ui.jsx'

const EQUIPO = 'Lucía Cárdenas, Flor Martínez, Carlos Contreras, Carlos Ipiña y María José Meza'

// Cierre y pie en el mismo azul de noche (el fondo de la ilustración), como una sola pieza.
export default function Cierre({ irA }) {
  const ir = (e, id) => {
    e.preventDefault()
    irA(id)
  }
  return (
    <footer className="cierre">
      <div className="envoltura cierre-grid">
        <div className="cierre-texto">
          <h2>Mientras antes conozcas tu número, más opciones tienes</h2>
          <p>Puedes seguir cotizando, ahorrar por tu cuenta o retirarte un poco después. Vuelve a tu cálculo y prueba cada camino.</p>
          <button type="button" className="btn btn-claro" onClick={() => irA('mi-pension')}>Volver a mi cálculo</button>
        </div>
        <Plastilina nombre="noche" sizes="(max-width: 760px) 70vw, 420px" className="cierre-img" />
      </div>

      <div className="envoltura pie">
        <div className="pie-marca">
          <Logo size={26} />
          <span>Pensiones IMSS</span>
        </div>
        <nav className="pie-links" aria-label="Secciones (pie de página)">
          {SECCIONES.map(([id, texto]) => (
            <a key={id} href={'#' + id} onClick={(e) => ir(e, id)}>{texto}</a>
          ))}
          <a href="#antes-de-usar" onClick={(e) => ir(e, 'antes-de-usar')}>Fuentes</a>
        </nav>
        <p className="pie-equipo">Proyecto escolar del Equipo 2, Tema 9: {EQUIPO}.</p>
        <p className="pie-legal">
          Simulación didáctica, no es asesoría financiera ni un sitio oficial del IMSS. Confirma montos y requisitos en el{' '}
          <a href="https://www.imss.gob.mx" target="_blank" rel="noreferrer">IMSS</a> y la{' '}
          <a href="https://www.gob.mx/consar" target="_blank" rel="noreferrer">CONSAR</a>. Las ilustraciones de plastilina se generaron con IA.
        </p>
      </div>
    </footer>
  )
}
