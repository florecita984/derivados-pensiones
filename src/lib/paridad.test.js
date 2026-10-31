// Paridad con la calculadora de referencia (pension_ley73_vs_ley97.html): se ejecuta su <script> con un
// DOM falso y se compara, caso por caso, contra src/lib. Se corre con: npm test (node:test, sin dependencias).
// Solo queda la parte de "Ahorrar", que no depende de la ley. Las pruebas de Ley 73, Ley 97 y Modalidad 40
// dejaron de compararse con el HTML del curso porque la auditoría corrigió esas fórmulas: ahora se prueban
// contra la ley en src/lib/ley.test.js.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { money } from './formato.js'
import { retiroMinimo } from './pension.js'
import { calcAhorro } from './ahorro.js'

// Carga las funciones de la referencia sin el cableado de pestañas y eventos del final del script.
function referencia() {
  const html = readFileSync(new URL('../../pension_ley73_vs_ley97.html', import.meta.url), 'utf8')
  const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'))
  const cuerpo = js.slice(0, js.indexOf("$$('.tabs button')"))
  const els = {}
  const $ = (id) => (els[id] ||= { value: '', textContent: '', innerHTML: '', checked: false, min: '', nextSibling: null, classList: { toggle() {} } })
  const documento = { getElementById: $, querySelectorAll: () => [] }
  const ref = new Function('document', cuerpo + '; return { ley73, ley97, get, calc1, calc2, calc4 }')(documento)
  const poner = (valores) =>
    Object.entries(valores).forEach(([k, v]) => (typeof v === 'boolean' ? ($(k).checked = v) : ($(k).value = String(v))))
  return { ...ref, $, poner }
}

// Generador pseudoaleatorio con semilla: los casos son siempre los mismos.
function azar(semilla) {
  let s = semilla >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}
const entre = (r, a, b, paso = 1) => a + Math.floor(r() * (Math.floor((b - a) / paso) + 1)) * paso

const texto = (html) => html.replace(/<[^>]+>/g, '')

function casoPension(r) {
  const edad = entre(r, 15, 74)
  return {
    edad,
    sbc: r() < 0.15 ? entre(r, 0, 9000, 1000) : entre(r, 0, 500000, 1000),
    ini: entre(r, 1930, 2026),
    ret: entre(r, retiroMinimo(edad), 75),
    aho: r() < 0.5 ? 0 : entre(r, 0, 20000000, 100000),
    esp: r() < 0.4,
    hij: r() < 0.6 ? 0 : entre(r, 0, 10),
    pad: r() < 0.7 ? 0 : entre(r, 0, 2),
  }
}
const casoAhorro = (r) => ({
  s0: r() < 0.4 ? 0 : entre(r, 0, 5000000, 10000),
  sm: entre(r, 0, 100000, 500),
  rt: entre(r, 0, 40) / 2,
  ys: entre(r, 1, 60),
  inf: entre(r, 0, 20) / 2,
  goal: entre(r, 100000, 100000000, 100000),
})

test('"Ahorrar" coincide con la referencia', () => {
  const ref = referencia()
  const r = azar(2026)
  for (let n = 0; n < 250; n++) {
    const f = casoPension(r)
    const a = casoAhorro(r)
    ref.poner({ ...f, x11: false, ...a })
    ref.calc4()
    const h = calcAhorro(a)
    const c4 = texto(ref.$('c4').innerHTML)
    assert.ok(c4.includes(money(h.F)), 'total final')
    assert.ok(c4.includes(`De eso, ${money(h.put)} los pusiste tú y ${money(h.F - h.put)} (${h.pctIntereses}%) son intereses.`), 'desglose')
    assert.ok(c4.includes(`equivaldría a unos ${money(h.real)}.`), 'pesos de hoy')
    assert.ok(c4.includes(h.need > 0 ? `ahorrar ${money(h.need)} al mes.` : 'nada más: ya con lo que tienes llegas.'), 'meta')
    if (h.w) assert.ok(c4.includes(`juntarías ${money(h.w)}: pierdes ${money(h.F - h.w)}.`), 'esperar 10 años')
    else assert.ok(!c4.includes('Si esperas 10 años'), 'sin aviso de 10 años')
  }
})
