// Textos compartidos entre Inicio y Aprende.

export const LEYES = [
  {
    id: '73',
    icon: 'landmark',
    tag: 'Antes del 1 de julio de 1997',
    nombre: 'Ley 73',
    lema: 'Se basa en tu salario',
    definicion:
      'El IMSS te paga una pensión calculada con tu sueldo de los últimos 5 años y tus semanas trabajadas. Es como un sueldo de jubilado que se paga entre todos. Aplica a quien empezó a cotizar antes del 1 de julio de 1997.',
    puntos: [
      'El IMSS calcula la pensión con el sueldo de los últimos 5 años.',
      'Requiere un mínimo de 500 semanas cotizadas.',
      'Funciona como un sueldo de jubilado financiado entre todos.',
    ],
  },
  {
    id: '97',
    icon: 'wallet',
    tag: 'Desde el 1 de julio de 1997',
    nombre: 'Ley 97',
    lema: 'Se basa en tu ahorro',
    definicion:
      'Tu pensión sale de tu propio ahorro en la Afore. Entre más ahorras y más años pasan, más crece. Si tu ahorro es muy bajo, el gobierno te garantiza una pensión mínima.',
    puntos: [
      'La pensión proviene de lo acumulado en la Afore.',
      'Requiere 875 semanas en 2026 (aumenta hasta 1,000).',
      'Si el ahorro es muy bajo, el gobierno garantiza una pensión mínima.',
    ],
  },
]

export const FILAS = [
  ['¿A quién le toca?', 'A quien empezó a cotizar antes del 1 de julio de 1997.', 'A quien empezó a cotizar a partir del 1 de julio de 1997.'],
  ['¿De dónde sale la pensión?', 'De una fórmula con tu sueldo promedio de los últimos 5 años y tus semanas cotizadas.', 'Del ahorro acumulado en tu Afore y sus rendimientos.'],
  ['Semanas mínimas', '500.', '875 en 2026 (sube 25 por año hasta llegar a 1,000).'],
  ['Edad de retiro', '65 años. Desde los 60 se puede, con 5% menos por cada año que te adelantes.', 'Entre los 60 y los 65 años; mientras más tarde, mayor es tu ahorro.'],
  ['Pensión mínima', 'Nunca baja de 1 salario mínimo.', 'Pensión garantizada si tu ahorro no alcanza.'],
]

export const GLOSARIO = [
  ['UMA', 'Unidad de Medida y Actualización. Un valor en pesos que el gobierno usa como regla para topes y cuotas. En 2026 vale $117.31 al día.', 'landmark'],
  ['Semanas cotizadas', 'Las semanas en que tu patrón (o tú) pagó al IMSS por ti. Piden mínimo 500 en la Ley 73 y 875 en la Ley 97 durante 2026 (sube 25 por año hasta 1,000).', 'clock'],
  ['Afore', 'La cuenta donde se junta tu ahorro para el retiro. La administra una empresa y rinde intereses.', 'wallet'],
  ['Sueldo base de cotización', 'El sueldo con el que el IMSS te registra. Tiene tope de 25 UMA.', 'user'],
  ['Pensión garantizada', 'La pensión mínima que el gobierno completa si tu Afore no alcanza.', 'shield'],
]

export const FUENTES =
  'Acuerdo ACDO.AS2.HCT.101026/302.P.DG del Consejo Técnico del IMSS, publicado en el DOF el 21-oct-2026 (Modalidad 40). Notas: El Financiero y Infobae (21-oct-2026), Canitas (oct-2026). UMA 2026: INEGI, DOF del 9-ene-2026. Salario mínimo 2026: $315.04 diarios (zona general). Ley del Seguro Social, arts. 167 y 168 (Ley 73) y 170 (Ley 97). Material y especificaciones del curso.'
