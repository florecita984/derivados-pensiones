// Utilidades de dibujo para las gráficas de líneas (solo geometría SVG).

// Curva suave que no se pasa de los puntos: [[x, y], ...] -> atributo "d" de un path.
export function curva(pts) {
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`
  return pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x},${y}`
      const [px, py] = pts[i - 1]
      const mx = (px + x) / 2
      return `C${mx},${py} ${mx},${y} ${x},${y}`
    })
    .join(' ')
}

// Área rellena bajo la curva hasta la línea base.
export function area(pts, base) {
  return `${curva(pts)} L${pts[pts.length - 1][0]},${base} L${pts[0][0]},${base} Z`
}
