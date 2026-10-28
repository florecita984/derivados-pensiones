// Retos de "Pon a prueba tu intuición financiera". Cada respuesta correcta se CALCULA
// con las funciones de ahorro.js; nada está escrito a mano.
import { money } from './calc.js'
import { compararInicio, saldoPlan, RENDIMIENTO_BASE, RENDIMIENTO_BASE_PCT } from './ahorro.js'

const pct = (t) => (t * 100).toLocaleString('es-MX', { maximumFractionDigits: 1 }) + '%'
const R = RENDIMIENTO_BASE

export const RETOS = [
  {
    id: 'ana-beto',
    titulo: 'Ana vs. Beto',
    pregunta: 'Ana y Beto ahorran lo mismo, pero Beto empieza tres meses después. ¿Quién tendrá más a los 65?',
    datos: [
      ['Aportación', '$1,000 al mes'],
      ['Edad hoy', '25 años'],
      ['Retiro', '65 años'],
      ['Rendimiento', pct(R) + ' anual'],
    ],
    opciones: [
      { id: 'ana', texto: 'Ana' },
      { id: 'beto', texto: 'Beto' },
      { id: 'igual', texto: 'Prácticamente lo mismo' },
    ],
    probar: { modo: 'mensual', aportacion: 1000, saldoInicial: 0, edad: 25, retiro: 65, tasa: RENDIMIENTO_BASE_PCT },
    resolver() {
      const r = compararInicio({ aportacion: 1000, edad: 25, retiro: 65, tasaAnual: R })
      return {
        correcta: r.hoy.final > r.despues.final ? 'ana' : r.hoy.final < r.despues.final ? 'beto' : 'igual',
        barras: [
          { nombre: 'Ana · empieza hoy', valor: r.hoy.final, color: 'var(--sA)' },
          { nombre: 'Beto · en 3 meses', valor: r.despues.final, color: 'var(--sB)' },
        ],
        explicacion: `Beto solo dejó de aportar ${money(r.aportacionNoHecha)}, pero al retiro tiene ${money(r.dif.absoluta)} menos: esos tres pagos habrían crecido durante 40 años.`,
      }
    },
  },
  {
    id: 'unica',
    titulo: 'Una aportación, dos momentos',
    pregunta: 'Dos personas invierten $10,000 una sola vez. Una lo hace hoy y la otra espera tres meses. ¿Cuál termina con más a los 65?',
    datos: [
      ['Monto único', '$10,000'],
      ['Edad hoy', '25 años'],
      ['Retiro', '65 años'],
      ['Rendimiento', pct(R) + ' anual'],
    ],
    opciones: [
      { id: 'hoy', texto: 'La que invierte hoy' },
      { id: 'despues', texto: 'La que espera 3 meses' },
      { id: 'igual', texto: 'Igual: es el mismo dinero' },
    ],
    probar: { modo: 'unica', aportacion: 1000, saldoInicial: 10000, edad: 25, retiro: 65, tasa: RENDIMIENTO_BASE_PCT },
    resolver() {
      const r = compararInicio({ saldoInicial: 10000, edad: 25, retiro: 65, tasaAnual: R }, 'unica')
      return {
        correcta: r.dif.absoluta > 0 ? 'hoy' : r.dif.absoluta < 0 ? 'despues' : 'igual',
        barras: [
          { nombre: 'Invierte hoy', valor: r.hoy.final, color: 'var(--sA)' },
          { nombre: 'Invierte en 3 meses', valor: r.despues.final, color: 'var(--sB)' },
        ],
        explicacion: `Ambas pusieron $10,000, pero quien invirtió hoy tiene ${money(r.dif.absoluta)} más: su dinero tuvo tres meses extra para generar rendimientos sobre rendimientos.`,
      }
    },
  },
  {
    id: '25-35',
    titulo: 'Empezar a los 25 vs. a los 35',
    pregunta: 'Sofía empieza a los 25 y Mateo a los 35. Ambos ahorran $1,000 al mes hasta los 65. ¿Cuántas veces más tendrá Sofía?',
    datos: [
      ['Aportación', '$1,000 al mes'],
      ['Sofía aporta', '40 años · $480,000'],
      ['Mateo aporta', '30 años · $360,000'],
      ['Rendimiento', pct(R) + ' anual'],
    ],
    opciones: [
      { id: 'r1', texto: 'Menos de 1.5 veces' },
      { id: 'r2', texto: 'Entre 1.5 y 2 veces' },
      { id: 'r3', texto: 'Más de 2 veces' },
    ],
    probar: { modo: 'mensual', aportacion: 1000, saldoInicial: 0, edad: 25, retiro: 65, tasa: RENDIMIENTO_BASE_PCT },
    resolver() {
      const a = saldoPlan({ aportacion: 1000, desde: 25, hasta: 65, tasaAnual: R })
      const b = saldoPlan({ aportacion: 1000, desde: 35, hasta: 65, tasaAnual: R })
      const veces = b.final > 0 ? a.final / b.final : 0
      return {
        correcta: veces < 1.5 ? 'r1' : veces <= 2 ? 'r2' : 'r3',
        barras: [
          { nombre: 'Sofía · desde los 25', valor: a.final, color: 'var(--sA)' },
          { nombre: 'Mateo · desde los 35', valor: b.final, color: 'var(--sB)' },
        ],
        explicacion: `Sofía aporta solo ${(a.aportado / b.aportado).toFixed(2)} veces lo que Mateo, pero termina con ${veces.toFixed(1)} veces más (${money(a.final - b.final)} de diferencia). Los primeros 10 años son los que más tiempo tienen para crecer.`,
      }
    },
  },
  {
    id: 'pesa-mas',
    titulo: '¿Qué pesa más?',
    pregunta: 'Carla aporta más dinero cada mes; Diego aporta menos, pero empieza antes. ¿Quién llega con más a los 65?',
    datos: [
      ['Carla', '$1,500 al mes · de 35 a 65'],
      ['Total Carla', '$540,000 aportados'],
      ['Diego', '$1,000 al mes · de 25 a 65'],
      ['Total Diego', '$480,000 aportados'],
    ],
    opciones: [
      { id: 'carla', texto: 'Carla: aporta más' },
      { id: 'diego', texto: 'Diego: empieza antes' },
    ],
    probar: { modo: 'mensual', aportacion: 1000, saldoInicial: 0, edad: 25, retiro: 65, tasa: RENDIMIENTO_BASE_PCT },
    resolver() {
      const c = saldoPlan({ aportacion: 1500, desde: 35, hasta: 65, tasaAnual: R })
      const d = saldoPlan({ aportacion: 1000, desde: 25, hasta: 65, tasaAnual: R })
      const gana = d.final >= c.final ? 'diego' : 'carla'
      return {
        correcta: gana,
        barras: [
          { nombre: 'Carla · $1,500 desde los 35', valor: c.final, color: 'var(--sB)' },
          { nombre: 'Diego · $1,000 desde los 25', valor: d.final, color: 'var(--sA)' },
        ],
        explicacion:
          gana === 'diego'
            ? `Diego aporta ${money(c.aportado - d.aportado)} menos y aun así termina con ${money(d.final - c.final)} más. Con un ${pct(R)} anual, diez años extra pesan más que $500 adicionales al mes.`
            : `Con estos supuestos, aportar más compensa empezar después: Carla termina con ${money(c.final - d.final)} más.`,
      }
    },
  },
]
