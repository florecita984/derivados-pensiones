import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

export function Logo() {
  return (
    <svg className="logo" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#0b1f3f" />
      <rect x="9" y="19" width="5" height="9" rx="1.5" fill="#ffffff" opacity=".55" />
      <rect x="15.5" y="14" width="5" height="14" rx="1.5" fill="#ffffff" opacity=".8" />
      <rect x="22" y="8" width="5" height="20" rx="1.5" fill="#ffffff" />
      <circle cx="26" cy="8" r="2.4" fill="#c9a24a" />
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
          <span className="brand-t">
            <strong>Pensiones IMSS</strong>
            <small>Ley 73 · Ley 97</small>
          </span>
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
              {v.nuevo && <span className="nuevo">Nuevo</span>}
            </button>
          ))}
        </nav>

        <div className="nav-cta">
          <button className="btn btn-primary btn-sm cta-desk" onClick={() => navegar('simulador')}>
            Iniciar simulación
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
