import { TouchSpin } from '@touchspin/core'
import { VanillaRenderer } from '@touchspin/renderer-vanilla'
import '@touchspin/renderer-vanilla/src/vanilla.css'

// Set global default renderer
globalThis.TouchSpinDefaultRenderer = VanillaRenderer

const input = document.getElementById('qty')
const api = TouchSpin(input, { min: 0, max: 10, step: 1, decimals: 0 })

// Wire controls
const $ = (id) => document.getElementById(id)
$('btn-up-once').onclick = () => api.upOnce()
$('btn-down-once').onclick = () => api.downOnce()
$('btn-start-up').onclick = () => api.startUpSpin()
$('btn-start-down').onclick = () => api.startDownSpin()
$('btn-stop').onclick = () => api.stopSpin()

// Event log
const log = $('log')
const addLog = (msg) => { const l = document.createElement('div'); l.textContent = msg; log.prepend(l) }
;['min','max','startspin','startupspin','startdownspin','stopupspin','stopdownspin','stopspin','boostchange']
  .forEach(evt => api.on(evt, (d) => addLog(`${evt}${d? ' '+JSON.stringify(d):''}`)))

// CSS variables editor
document.querySelectorAll('[data-var]').forEach(inp => {
  inp.addEventListener('input', () => {
    document.documentElement.style.setProperty(inp.getAttribute('data-var'), inp.value)
  })
})

// Show source blocks
const srcHtml = `<input id="qty" data-testid="qty" type="text" value="2" />`
const srcJs = `import { TouchSpin } from '@touchspin/core'\nimport { VanillaRenderer } from '@touchspin/renderer-vanilla'\nimport '@touchspin/renderer-vanilla/src/vanilla.css'\n\nglobalThis.TouchSpinDefaultRenderer = VanillaRenderer\n\nconst input = document.querySelector('#qty')\nTouchSpin(input, { min: 0, max: 10 })`
const srcCss = `:root{\n  --ts-font-size: 14px; --ts-height: 32px; --ts-radius: 6px; --ts-gap: 4px;\n  --ts-bg:#fff; --ts-fg:#1f2937; --ts-border:#cbd5e1;\n  --ts-btn-bg:#f3f4f6; --ts-btn-fg:#111827; --ts-btn-hover-bg:#e5e7eb;\n}`

document.getElementById('src-html').textContent = srcHtml
document.getElementById('src-js').textContent = srcJs
document.getElementById('src-css').textContent = srcCss

