// Textos de la página. Las definiciones, el aviso, las fuentes y los supuestos son los de la
// calculadora de referencia (pension_ley73_vs_ley97.html), con la misma redacción.
import { money } from './formato.js'
import { P, TOPE } from './pension.js'

export const LEY_EN_UNA_FRASE = {
  73: 'El IMSS te paga una pensión calculada con tu sueldo de los últimos 5 años y tus semanas trabajadas. Es como un sueldo de jubilado que se paga entre todos. Aplica a quien empezó a cotizar antes del 1 de julio de 1997.',
  97: 'Tu pensión sale de tu propio ahorro en la Afore. Entre más ahorras y más años pasan, más crece. Si tu ahorro es muy bajo, el gobierno te garantiza una pensión mínima.',
}

export const GLOSARIO = {
  uma: 'Unidad de Medida y Actualización. Un valor en pesos que el gobierno usa como regla para topes y cuotas. En 2026 vale $117.31 al día.',
  semanas: 'Las semanas en que tu patrón (o tú) pagó al IMSS por ti. Piden mínimo 500 en la Ley 73 y 875 en la Ley 97 durante 2026 (sube 25 por año hasta 1,000).',
  afore: 'La cuenta donde se junta tu ahorro para el retiro. La administra una empresa y rinde intereses.',
  sbc: 'El sueldo con el que el IMSS te registra. Tiene tope de 25 UMA.',
  interes: 'Cuando los intereses que ganas también generan intereses. Por eso ahorrar desde joven rinde tanto: el tiempo trabaja por ti.',
  garantizada: 'La pensión mínima que el gobierno completa si tu Afore no alcanza.',
}

// Explicación bajo cada pregunta del simulador.
export const AYUDA = {
  sbc: `Es el salario con el que el IMSS te tiene registrado, no necesariamente lo que te depositan. El control va de 1 salario mínimo (${money(P.sm)}) a 25 UMA (${money(TOPE)}), que es lo que el IMSS acepta: la cifra que ves es la que usamos. Si escribes algo fuera de ese rango, te avisamos con cuál calculamos.`,
  ini: 'Esto decide qué ley te toca. Usamos la ley de hoy: no podemos pronosticar cambios futuros.',
  ret: 'Desde los 60 años. Antes de los 65 te pagan menos en la Ley 73 (5% menos por cada año que te adelantes); si te retiras después de los 65, tu pensión sube.',
  aho: 'La Afore es la cuenta donde se guarda tu ahorro para el retiro. Si no lo sabes, déjalo en $0 y lo estimamos.',
  esp: 'Ley 73: suma 15% a la pensión.',
  hij: 'Menores de 16 años, hasta 25 si estudian, o con discapacidad. Ley 73: +10% por cada uno.',
  pad: 'Solo cuentan si no tienes esposa(o) ni hijos: +10% por cada uno (y +10% más si es solo uno). Si no tienes a nadie, la ley da una ayuda asistencial de 15%. En la Ley 97 tu familia no cambia el monto.',
  u: `Es el último salario base de cotización con el que el IMSS te tuvo registrado al darte de baja, no lo que te depositaban en la nómina. El control va de 1 salario mínimo (${money(P.sm)}) a 25 UMA (${money(TOPE)}): la cifra que ves es la que usamos. Si escribes algo fuera de ese rango, te avisamos con cuál calculamos.`,
  sem: '52 semanas = 1 año, 104 = 2 años, 156 = 3 años y así. Mínimo 52 semanas en los últimos 5 años para entrar a Modalidad 40; para pensionarte en Ley 73 necesitas 500 en total.',
  m: 'Las fuentes consultadas no marcan un mínimo de años. Cuentan desde 2026: la cuota sube cada año. Tu pensión se calcula con tus últimas 250 semanas (unos 5 años), así que más de 5 años ya solo suma semanas.',
  rt: 'Por ejemplo 5% anual. A más rendimiento, más riesgo; nada está garantizado.',
  inf: 'Sirve para ver cuánto valdría ese dinero en pesos de hoy.',
}

export const SUPUESTOS =
  'UMA 2026: $3,566.22 al mes. Salario mínimo 2026: $315.04 diarios. Tu sueldo sube 4.5% al año; UMA y salario mínimo, 3.5%; tu Afore rinde 7% anual. Las cifras están en pesos del año en que te retiras, no en pesos de hoy. Suponemos que cotizas las 52 semanas de cada año y que tu sueldo sube parejo: tu promedio real de las últimas 250 semanas puede ser distinto (míralo en tu Constancia de semanas cotizadas). En la Ley 73 la pensión con asignaciones no pasa de tu sueldo promedio, salvo que los incrementos por semanas ya lo superen (art. 169); no incluimos el aguinaldo de un mes que paga la Ley 73. En la Ley 97 el factor de anualidad es exacto solo a los 61, 62 y 64 años; en las demás edades es una estimación. La pensión mínima de la Ley 73 es 1 salario mínimo más 11% del decreto (unos $10,637 en 2026). La pensión garantizada de la Ley 97 sale de una tabla del art. 170 (de $3,540.56 a $11,128.01 en 2026): aquí es una aproximación según edad, semanas y sueldo. Es una simulación didáctica, no una asesoría.'

export const M40_TEXTOS = {
  intro:
    'Es seguir pagando al IMSS por tu cuenta cuando dejas de trabajar, para juntar semanas y subir tu pensión (aplica a la Ley 73). Para entrar necesitas estar dado de baja del IMSS y tener al menos 52 semanas cotizadas en los últimos 5 años.',
  antes: 'Podías elegir un sueldo de hasta 25 UMA (unos $89,000 al mes) y hasta registrarte con fechas pasadas.',
  ahora: 'Solo tu último sueldo registrado, o ese más 1 UMA. Sin fechas pasadas y el trámite es digital.',
  inscritos:
    'Quien ya estaba inscrito antes del 22 de octubre conserva sus condiciones hasta terminar el periodo que contrató. El IMSS revisará en 6 meses si el esquema sigue.',
  como:
    'Pensión a los 65 años, en pesos de hoy, con la fórmula de la Ley 73 sobre el promedio de tus últimos 5 años de sueldo (250 semanas). Nunca baja de la pensión mínima garantizada de la Ley 73 (1 salario mínimo + 11% del decreto, unos $10,637 en 2026). La cuota depende del tramo de tu sueldo y sube cada enero: en 2026 es 14.438% desde 4.01 UMA y llega a 18.80% en 2030; sumamos la de cada año que pagues. Los incrementos por semanas siguen la regla del art. 167 (la mitad con 13 a 26 semanas sobrantes, completo con más de 26). Es una estimación, no una cantidad garantizada. No incluimos asignaciones familiares ni aguinaldo.',
}

export const AVISO_INTRO =
  'Esta página es una simulación didáctica. Las calculadoras de CONSAR y de las Afores usan otros supuestos, por eso no darán el mismo número:'

export const AVISO = [
  ['Pesos', 'CONSAR muestra el monto en pesos de hoy. Aquí se muestra en pesos del año en que te retiras. Para comparar, divide entre 1.035 elevado a los años que faltan (3.5% de inflación).'],
  ['Rendimiento', 'CONSAR usa 4% real y descuenta la comisión de la Afore (0.55% anual en 2025). Aquí son 7% nominal y sin comisión.'],
  ['Sueldo', 'CONSAR no lo aumenta; aquí sube 4.5% al año.'],
  ['Constancia', 'CONSAR supone que cotizas 80% del tiempo; aquí, 100%.'],
  ['Anualidad', 'CONSAR calcula la renta solo para el titular, con tablas de mortalidad y un margen de seguridad de 2%. Aquí usamos un factor del curso que incluye beneficiarios, y solo es exacto a los 61, 62 y 64 años.'],
  ['Subcuentas', 'No sumamos vivienda (Infonavit) ni cuota social (para quien gana hasta 4 UMA).'],
  ['Aportaciones', 'Usamos la tabla de la ley: retiro 2%, cesantía y vejez del patrón según tu tramo de sueldo (de 3.150% a 7.513% en 2026, subiendo hasta 2030) y 1.125% tuyo. Otras calculadoras suelen usar un porcentaje fijo.'],
  ['Pensión garantizada de la Ley 97', 'Es una aproximación; la tabla oficial cruza edad, semanas y sueldo.'],
  ['El 11%', 'La pensión mínima de la Ley 73 ya lo incluye (decreto del DOF de 2004). La casilla del curso lo suma además a toda la pensión de la Ley 73; en la Ley 97 no se aplica.'],
]

// Cada fuente es un texto o { texto, url }. Primero van las oficiales; después, las notas de apoyo.
export const FUENTES = [
  { texto: 'Acuerdo ACDO.AS2.HCT.101026/302.P.DG del Consejo Técnico del IMSS, publicado en el DOF el 21-oct-2026 (Modalidad 40): documento oficial en SIDOF.', url: 'https://sidof.segob.gob.mx/notas/docFuente/5801708' },
  { texto: 'Ley del Seguro Social de 1973 (texto vigente para la Ley 73), arts. 164, 167, 168, 169 y 171: documento del IMSS.', url: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/4129_LSS_1973.pdf' },
  { texto: 'Decreto del DOF del 5-ene-2004 (art. décimo cuarto transitorio): factor de 1.11 en pensiones.', url: 'https://www.dof.gob.mx/nota_detalle.php?codigo=676437&fecha=05/01/2004' },
  { texto: 'Ley del Seguro Social vigente (Ley 97), art. 170 y reforma del DOF del 16-dic-2020: Cámara de Diputados.', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf' },
  { texto: 'Salario mínimo 2026 ($315.04 diarios, zona general): resolución de la CONASAMI, DOF.', url: 'https://dof.gob.mx/nota_detalle_popup.php?codigo=5775534' },
  { texto: 'UMA 2026 ($117.31 diarios): INEGI, DOF del 9-ene-2026.', url: 'https://www.inegi.org.mx/temas/uma/' },
  'Notas: El Financiero y Infobae (21-oct-2026), Canitas (oct-2026).',
  'Asignaciones familiares y ayuda asistencial (Ley 73): IMSS y art. 164 de la Ley del Seguro Social de 1973.',
  'Requisitos de Modalidad 40 (52 semanas en los últimos 5 años, tope de 25 UMA): IMSS, UnoTV y Expansión (2025-2026).',
  'Semanas mínimas de la Ley 97 (875 en 2026, 1,000 en 2031): reforma de 2020, artículo cuarto transitorio; Expansión y UnoTV (2026).',
  'Porcentajes por retiro anticipado (art. 171): IMSS y UnoTV (2026).',
  'Pensión mínima Ley 73 (art. 168; 1 salario mínimo + 11% del decreto): HaceCuentas y UnoTV (2026).',
  'Pensión garantizada Ley 97, de $3,540.56 a $11,128.01 en 2026: El Contribuyente y Cronista (2026).',
  'Metodología de la proyección de la Ley 97 (Afore SURA, 2025, alineada con CONSAR): 4% real, comisión de 0.55%, constancia de 80%, margen de seguridad de 2%.',
  'Material y especificaciones del curso.',
]
