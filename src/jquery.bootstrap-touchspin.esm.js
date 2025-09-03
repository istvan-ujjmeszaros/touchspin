// ESM twin loader for Bootstrap TouchSpin.
// Internals remain the same jQuery-based plugin, but this module-friendly
// entry dynamically loads the classic plugin source and registers it to
// window.jQuery when present.



function loadClassicPlugin() {
  const url = new URL('./jquery.bootstrap-touchspin.js', import.meta.url);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url.pathname + url.search + url.hash;
    script.async = false; // preserve execution order
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export async function registerJQueryPlugin() {
  if (typeof window === 'undefined') return;
  if (!window.jQuery) throw new Error('jQuery not found on window for TouchSpin');
  // If plugin already present, nothing to do
  if (window.jQuery.fn && typeof window.jQuery.fn.TouchSpin === 'function') return;
  await loadClassicPlugin();
}

// Auto-register on import for convenience
(async () => {
  try {
    if (typeof window !== 'undefined' && window.jQuery) {
      await registerJQueryPlugin();
    }
  } catch {
    // Swallow to avoid breaking pages; debugging can inspect console
    // console.warn('TouchSpin ESM loader failed:', e);
  }
})();

