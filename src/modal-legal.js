
const modal = document.getElementById('modal-legal');
const modalTexto = document.getElementById('modal-legal-texto');
const modalCerrar = document.getElementById('modal-legal-cerrar');
const btnArriba = document.getElementById('btn-ir-arriba');

function abrirModal(archivo) {
  fetch(archivo)
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const main = doc.querySelector('main') || doc.body;
      modalTexto.innerHTML = main.innerHTML;
      modal.hidden = false;
      document.body.classList.add('modal-abierto');
      modalTexto.scrollTop = 0;
    })
    .catch(() => {
      modalTexto.innerHTML = '<p>No se pudo cargar el contenido.</p>';
      modal.hidden = false;
      document.body.classList.add('modal-abierto');
    });
}

function cerrarModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-abierto');
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

window.addEventListener('scroll', () => {
  if (btnArriba) {
    btnArriba.hidden = window.scrollY < 300;
  }
});

btnArriba?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});