import { Logo } from './Navbar.jsx'

export default function Footer({ vistas, ir }) {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-brand">
          <Logo size={34} />
          <div>
            <strong>Pensiones IMSS</strong>
            <small>Tema 9 · Equipo 2</small>
          </div>
        </div>

        <ul className="foot-links">
          {vistas.map((v) => (
            <li key={v.id}><button onClick={() => ir(v.id)}>{v.texto}</button></li>
          ))}
        </ul>

        <p className="foot-team">
          Lucía Cárdenas · Flor Martínez · Carlos Contreras · Carlos Ipiña · María José Meza
        </p>
      </div>
      <p className="foot-legal">
        <b>Simulación didáctica, no es asesoría financiera.</b> Confirma montos y topes en el IMSS y la CONSAR.
      </p>
    </footer>
  )
}
