
const modal = document.getElementById('modal-legal');
const modalTexto = document.getElementById('modal-legal-texto');
const modalCerrar = document.getElementById('modal-legal-cerrar');
const btnArriba = document.getElementById('btn-ir-arriba');

function getScroller() {
  return modal?.querySelector('.modal-legal__contenido') || null;
}

function abrirModal(archivo) {
  if (window.__pausarEscena) window.__pausarEscena(true);
  if (window.__controls) window.__controls.enabled = false;

  fetch(archivo)
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const main = doc.querySelector('main') || doc.body;
      modalTexto.innerHTML = main.innerHTML;
      modal.hidden = false;
      document.body.classList.add('modal-abierto');
      const s = getScroller();
      if (s) s.scrollTop = 0;
      actualizarBotonArriba();
    })
    .catch(() => {
      modalTexto.innerHTML = '<p>No se pudo cargar el contenido.</p>';
      modal.hidden = false;
      document.body.classList.add('modal-abierto');
      actualizarBotonArriba();
    });
}

function cerrarModal() {
  if (window.__pausarEscena) window.__pausarEscena(false);
  if (window.__controls) window.__controls.enabled = true;
  modal.hidden = true;
  document.body.classList.remove('modal-abierto');
  if (btnArriba) btnArriba.hidden = true;
}

function actualizarBotonArriba() {
  if (!btnArriba) return;
  const s = getScroller();
  if (!s) {
    btnArriba.hidden = true;
    return;
  }
  btnArriba.hidden = s.scrollTop < 150;
}

modalCerrar?.addEventListener('click', cerrarModal);

modal?.addEventListener('click', (e) => {
  if (e.target === modal) cerrarModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) cerrarModal();
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  const esLegal = href.endsWith('about.html') || href.endsWith('terminos.html') || href.endsWith('privacidad.html');
  if (esLegal) {
    e.preventDefault();
    abrirModal(href);
  }
});

let _scrollerConListener = null;
function ensureScrollListener() {
  const s = getScroller();
  if (s && s !== _scrollerConListener) {
    if (_scrollerConListener) {
      _scrollerConListener.removeEventListener('scroll', actualizarBotonArriba);
    }
    _scrollerConListener = s;
    s.addEventListener('scroll', actualizarBotonArriba, { passive: true });
  }
}
const _obs = new MutationObserver(ensureScrollListener);
if (modal) _obs.observe(modal, { childList: true, subtree: true });

btnArriba?.addEventListener('click', () => {
  const s = getScroller();
  if (s) s.scrollTo({ top: 0, behavior: 'smooth' });
});