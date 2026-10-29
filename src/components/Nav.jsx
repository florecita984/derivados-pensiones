import { useEffect, useState } from 'react'
import { m } from 'motion/react'
import Icon from './Icon.jsx'

export const SECCIONES = [
  ['mi-pension', 'Mi pensión'],
  ['como-funciona', 'Cómo funciona'],
  ['modalidad-40', 'Modalidad 40'],
  ['ahorrar', 'Ahorrar'],
]

// Marca: dos barras, Ley 73 en azul y Ley 97 en naranja.
export function Logo({ size = 28 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4" y="4" width="10.5" height="21.5" rx="5.25" fill="var(--azul)" />
      <rect x="17.5" y="12.5" width="10.5" height="13" rx="5.25" fill="var(--naranja)" />
      <rect x="2" y="27.5" width="28" height="2.6" rx="1.3" fill="currentColor" />
    </svg>
  )
}

export default function Nav({ irA }) {
  const [activa, setActiva] = useState(null)
  const [elevada, setElevada] = useState(false)
  const [abierto, setAbierto] = useState(false)

  // Sección que ocupa la mitad de la pantalla (sin listeners de scroll).
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActiva(e.target.id)),
      { rootMargin: '-45% 0px -54% 0px' },
    )
    ;['inicio', ...SECCIONES.map(([id]) => id), 'antes-de-usar'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    const alDesplazar = () => setElevada(window.scrollY > 8)
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', alDesplazar)
    }
  }, [])

  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto])

  const ir = (e, id) => {
    e.preventDefault()
    setAbierto(false)
    irA(id)
  }

  return (
    <header className={'nav' + (elevada ? ' nav-up' : '') + (abierto ? ' nav-open' : '')}>
      <div className="envoltura nav-in">
        <a className="marca" href="#inicio" onClick={(e) => ir(e, 'inicio')}>
          <Logo />
          <span>Pensiones IMSS</span>
        </a>

        <nav className="nav-links" aria-label="Secciones">
          {SECCIONES.map(([id, texto]) => (
            <a key={id} href={'#' + id} className={activa === id ? 'on' : ''} aria-current={activa === id ? 'location' : undefined} onClick={(e) => ir(e, id)}>
              {activa === id && <m.span layoutId="nav-pildora" className="nav-pildora" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <span>{texto}</span>
            </a>
          ))}
        </nav>

        <a className="btn btn-primario btn-chico nav-cta" href="#mi-pension" onClick={(e) => ir(e, 'mi-pension')}>Calcular</a>
        <button
          type="button"
          className="nav-menu"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setAbierto((a) => !a)}
        >
          <Icon name={abierto ? 'x' : 'menu'} size={20} strokeWidth={2} />
        </button>
      </div>

      <nav className={'menu' + (abierto ? ' on' : '')} id="menu-movil" aria-label="Secciones" inert={!abierto}>
        {SECCIONES.map(([id, texto]) => (
          <a key={id} href={'#' + id} className={activa === id ? 'on' : ''} onClick={(e) => ir(e, id)}>
            {texto}
          </a>
        ))}
        <a href="#antes-de-usar" onClick={(e) => ir(e, 'antes-de-usar')}>Antes de usar estos números</a>
      </nav>
    </header>
  )
}
