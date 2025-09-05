import { TouchSpin } from '@touchspin/core'
import { VanillaRenderer } from '@touchspin/renderer-vanilla'

// Set global default renderer
globalThis.TouchSpinDefaultRenderer = VanillaRenderer

const input = document.getElementById('qty')
const api = TouchSpin(input, { min: 0, max: 1000000, step: 1, decimals: 0, prefix: '$', postfix: 'kg' })

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

// Log native change from the input
input.addEventListener('change', () => addLog(`change value=${input.value}`))

// CSS variables editor
document.querySelectorAll('[data-var]').forEach(inp => {
  inp.addEventListener('input', () => {
    document.documentElement.style.setProperty(inp.getAttribute('data-var'), inp.value)
  })
})

// Prefix/Postfix inputs next to component
document.getElementById('ctrl-prefix').addEventListener('input', (e) => api.updateSettings({ prefix: e.target.value }))
document.getElementById('ctrl-postfix').addEventListener('input', (e) => api.updateSettings({ postfix: e.target.value }))

// Show source blocks
const srcHtml = `<input id="qty" data-testid="qty" type="text" value="2" />`
const srcJs = `import { TouchSpin } from '@touchspin/core'\nimport { VanillaRenderer } from '@touchspin/renderer-vanilla'\n\nglobalThis.TouchSpinDefaultRenderer = VanillaRenderer\n\nconst input = document.querySelector('#qty')\nTouchSpin(input, { min: 0, max: 1000000, prefix: '$', postfix: 'kg' })`
const srcCss = `:root{\n  --ts-font-size: 14px; --ts-height: 32px; --ts-gap: 0px;\n  --ts-wrapper-radius: 6px; --ts-down-radius: 6px; --ts-up-radius: 6px;\n  --ts-bg:#fff; --ts-fg:#1f2937; --ts-wrapper-border:#cbd5e1; --ts-button-border:#cbd5e1; --ts-affix-border:#cbd5e1;\n  --ts-btn-bg:#f3f4f6; --ts-btn-fg:#111827; --ts-btn-hover-bg:#e5e7eb;\n}`

document.getElementById('src-html').textContent = srcHtml
document.getElementById('src-js').textContent = srcJs
document.getElementById('src-css').textContent = srcCss
