import { Logo } from './Navbar.jsx'

export default function Footer({ vistas, ir }) {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-brand">
          <div className="foot-logo">
            <Logo />
            <strong>Pensiones IMSS</strong>
          </div>
          <p>Simulador comparativo de la pensión bajo la Ley 73 y la Ley 97. Proyecto académico del Tema 9.</p>
        </div>

        <div>
          <h4>Secciones</h4>
          <ul>
            {vistas.map((v) => (
              <li key={v.id}><button onClick={() => ir(v.id)}>{v.texto}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Equipo 2</h4>
          <ul className="foot-team">
            <li>Lucía Cárdenas</li>
            <li>Flor Martínez</li>
            <li>Carlos Contreras</li>
            <li>Carlos Ipiña</li>
            <li>María José Meza</li>
          </ul>
        </div>
      </div>
      <div className="foot-legal">
        <div className="foot-in">
          <p>
            <b>Simulación didáctica, no es asesoría financiera.</b> Las cifras son estimaciones; confirma montos, topes y parámetros directamente en el IMSS y la CONSAR.
          </p>
        </div>
      </div>
    </footer>
  )
}
