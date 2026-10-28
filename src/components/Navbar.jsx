import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

export function Logo({ size = 38 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="11" fill="#0a1b3d" />
      <rect x="8" y="17" width="8" height="11" rx="2.4" fill="#2f6bff" />
      <rect x="20" y="9" width="8" height="19" rx="2.4" fill="#ff9f1c" />
    </svg>
  )
}

export default function Navbar({ vistas, vista, ir }) {
  const [abierto, setAbierto] = useState(false)
  const [elevada, setElevada] = useState(false)
  const links = useRef(null)
  const [ind, setInd] = useState(null)

  // Posición del indicador de la sección activa (se desliza entre enlaces en escritorio).
  useLayoutEffect(() => {
    const medir = () => {
      const el = links.current?.querySelector('button.on')
      setInd(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
    }
    medir()
    window.addEventListener('resize', medir)
    document.fonts?.ready.then(medir)
    return () => window.removeEventListener('resize', medir)
  }, [vista])

  // Cierra el menú móvil con Escape y marca la barra cuando se hace scroll.
  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && setAbierto(false)
    const alDesplazar = () => setElevada(window.scrollY > 8)
    alDesplazar()
    window.addEventListener('keydown', alTeclear)
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => {
      window.removeEventListener('keydown', alTeclear)
      window.removeEventListener('scroll', alDesplazar)
    }
  }, [])

  const navegar = (id) => {
    setAbierto(false)
    ir(id)
  }

  return (
    <header className={'nav' + (elevada ? ' nav-up' : '')}>
      <div className="nav-in">
        <button className="brand" onClick={() => navegar('inicio')} aria-label="Pensiones IMSS, ir al inicio">
          <Logo />
          <strong>Pensiones IMSS</strong>
        </button>

        <nav ref={links} className={'links' + (abierto ? ' open' : '')} id="menu-principal" aria-label="Secciones">
          {ind && <span className="links-ind" aria-hidden="true" style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} />}
          {vistas.map((v) => (
            <button
              key={v.id}
              className={vista === v.id ? 'on' : ''}
              aria-current={vista === v.id ? 'page' : undefined}
              onClick={() => navegar(v.id)}
            >
              {v.texto}
            </button>
          ))}
        </nav>

        <div className="nav-cta">
          <button className="btn btn-blue btn-sm cta-desk" onClick={() => navegar('simulador')}>
            Simular
            <Icon name="arrow" size={16} strokeWidth={2.4} />
          </button>
          <button
            className="burger"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
            aria-controls="menu-principal"
            onClick={() => setAbierto((a) => !a)}
          >
            <Icon name={abierto ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}
