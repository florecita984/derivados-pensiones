// Paridad con la calculadora de referencia (pension_ley73_vs_ley97.html): se ejecuta su <script> con un
// DOM falso y se compara, caso por caso, contra src/lib. Se corre con: npm test (node:test, sin dependencias).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { money } from './formato.js'
import { calcPension, datos, ley73, ley97, retiroMinimo, EDADES_RETIRO } from './pension.js'
import { calcM40 } from './m40.js'
import { calcAhorro, compararConLeyes } from './ahorro.js'

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

const cerca = (a, b, msg) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), `${msg}: ${a} ≠ ${b}`)
const montos = (html) => [...html.matchAll(/\$[\d,]+/g)].map((m) => m[0])
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

test('ley73 y ley97 dan lo mismo que la referencia en 400 casos y todas las edades de retiro', () => {
  const ref = referencia()
  const r = azar(73)
  for (let n = 0; n < 400; n++) {
    const f = casoPension(r)
    const x11 = r() < 0.2
    ref.poner({ ...f, x11 })
    const dRef = ref.get()
    const d = datos(f)
    for (const k of Object.keys(dRef)) assert.equal(d[k], dRef[k], `datos.${k}`)
    for (const e of EDADES_RETIRO.filter((e) => e > f.edad)) {
      const [a, aRef, b, bRef] = [ley73(d, e, x11), ref.ley73(dRef, e), ley97(d, e, x11), ref.ley97(dRef, e)]
      cerca(a.p, aRef.p, 'ley73.p')
      cerca(a.ult, aRef.ult, 'ley73.ult')
      assert.equal(a.ap, aRef.ap, 'ley73.ap')
      for (const k of ['p', 'saldo', 'g', 'ult', 'sem']) cerca(b[k], bRef[k], 'ley97.' + k)
    }
  }
})

test('los textos, avisos y la gráfica de "Mi pensión" coinciden con la referencia', () => {
  const ref = referencia()
  const r = azar(97)
  for (let n = 0; n < 250; n++) {
    const f = casoPension(r)
    const x11 = r() < 0.2
    ref.poner({ ...f, x11, ...casoAhorro(r) })
    ref.calc1()
    const res = calcPension(f, x11)
    assert.equal(res.textos.p73, ref.$('p73').textContent)
    assert.equal(res.textos.p97, ref.$('p97').textContent)
    assert.equal(res.textos.r73, ref.$('r73').textContent)
    assert.equal(res.textos.r97, ref.$('r97').textContent)
    assert.equal(res.msg, ref.$('msg').textContent)
    assert.equal(res.avisos.join(' '), ref.$('adv').textContent)
    // Gráfica: una barra por ley y por edad, con la edad elegida resaltada.
    const barras = [...ref.$('chart').innerHTML.matchAll(/<text [^>]*font-weight="(\d+)">(\d+)<\/text>/g)]
    assert.deepEqual(barras.map((m) => +m[2]), res.filas.map((fila) => fila[0]))
    assert.deepEqual(barras.filter((m) => m[1] === '700').map((m) => +m[2]), [f.ret])
  }
})

test('Modalidad 40 coincide con la referencia', () => {
  const ref = referencia()
  const r = azar(40)
  for (let n = 0; n < 300; n++) {
    const c = { ur: r() < 0.1 ? entre(r, 1, 9000, 500) : entre(r, 1, 500000, 500), sem: entre(r, 52, 2600, 13), m: entre(r, 1, 10) }
    ref.poner({ u: c.ur, sem: c.sem, m: c.m })
    ref.calc2()
    const html = ref.$('m40').innerHTML
    const res = calcM40(c)
    const esperado = res.opciones.flatMap((o) => (o.sbc ? [money(o.p), money(o.cuota), money(o.total)] : [money(o.p)]))
    assert.deepEqual(montos(html).slice(0, esperado.length), esperado)
    assert.ok(texto(html).endsWith(res.msg), 'mensaje de Modalidad 40')
  }
})

test('"Ahorrar" y la comparación con las leyes coinciden con la referencia', () => {
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

    const cmp = texto(ref.$('cmp').innerHTML)
    const k = compararConLeyes(calcPension(f, false), h)
    for (const o of k.opciones) assert.ok(cmp.includes(`${o.nombre}: ${money(o.p)} al mes`), o.nombre)
    if (k.gap > 0) {
      assert.ok(cmp.includes(`te faltan ${money(k.gap)} al mes.`), 'diferencia')
      if (k.paraIgualar) assert.ok(cmp.includes(`tendrías que ahorrar ${money(k.paraIgualar)} al mes desde hoy`), 'ahorro para igualar')
      assert.ok(cmp.includes(`cubre ${money(k.cubre)} de esos ${money(k.gap)}.`), 'lo que cubre el plan')
    } else assert.ok(cmp.includes(`(${money(-k.gap)} más al mes)`), 'Ley 97 igual o mayor')
  }
})
