// Genera una imagen (PNG) tipo "tarjeta" con el haiku o rayón seleccionado,
// pensada para compartirse nativamente en Instagram/WhatsApp/Facebook —
// el mismo patrón que usa Spotify al compartir una canción: en vez de
// depender de que la red social arme un preview desde una URL (que además
// falla en Facebook, que ignora el texto pre-llenado por seguridad/spam),
// se genera y comparte una imagen real con el contenido ya dentro.

const ANCHO = 1080;
const ALTO = 1350; // 4:5 — cabe bien en feed, historia y WhatsApp status

let logoImg = null;
function cargarLogo() {
  if (logoImg) return Promise.resolve(logoImg);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { logoImg = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = './assets/img/logo.webp';
  });
}

// hash simple para que la misma frase siempre genere el mismo patrón de
// "luciérnagas" de fondo — la tarjeta es reproducible, no aleatoria cada vez
function hashTexto(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function envolverTexto(ctx, texto, maxAncho) {
  const palabras = texto.split(' ');
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? actual + ' ' + p : p;
    if (ctx.measureText(prueba).width > maxAncho && actual) {
      lineas.push(actual);
      actual = p;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

function dibujarLuciernagas(ctx, seed) {
  const s = (n) => {
    const x = Math.sin(seed + n * 127.1) * 43758.5453123;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 26; i++) {
    const x = s(i * 2) * ANCHO;
    const y = s(i * 2 + 1) * ALTO;
    const r = 2 + s(i * 3) * 5;
    const color = s(i * 5) > 0.5 ? '255,107,53' : '79,195,247';
    const alpha = 0.15 + s(i * 7) * 0.35;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
    grad.addColorStop(0, `rgba(${color},${alpha})`);
    grad.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
  }
}

export async function generarTarjetaCompartir(texto, autor, cat) {
  const canvas = document.createElement('canvas');
  canvas.width = ANCHO;
  canvas.height = ALTO;
  const ctx = canvas.getContext('2d');

  // fondo
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, ANCHO, ALTO);

  const seed = hashTexto(texto);
  dibujarLuciernagas(ctx, seed);

  // resplandor central detrás del texto
  const glow = ctx.createRadialGradient(ANCHO / 2, ALTO * 0.48, 40, ANCHO / 2, ALTO * 0.48, ALTO * 0.55);
  glow.addColorStop(0, 'rgba(255,107,53,0.10)');
  glow.addColorStop(1, 'rgba(10,10,10,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // borde
  ctx.strokeStyle = 'rgba(255,107,53,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, ANCHO - 48, ALTO - 48);

  // logo + wordmark
  const logo = await cargarLogo();
  const topY = 110;
  if (logo) {
    const lw = 64, lh = 64;
    ctx.drawImage(logo, ANCHO / 2 - lw / 2, topY - lh - 18, lw, lh);
  }
  ctx.fillStyle = '#ff6b35';
  ctx.font = '600 26px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('J A R D Í N   D E L   O R Á C U L O', ANCHO / 2, topY);

  ctx.strokeStyle = 'rgba(255,107,53,0.4)';
  ctx.beginPath();
  ctx.moveTo(ANCHO / 2 - 70, topY + 26);
  ctx.lineTo(ANCHO / 2 + 70, topY + 26);
  ctx.stroke();

  // cuerpo del verso — si es haiku (tiene ' / '), una línea por verso;
  // si es rayón, se envuelve como párrafo normal
  const esHaiku = texto.includes(' / ');
  const versos = esHaiku ? texto.split(' / ') : [texto];

  const maxAnchoTexto = ANCHO - 200;
  let tamañoFuente = esHaiku ? 56 : 50;
  let lineas = [];

  do {
    ctx.font = `${tamañoFuente}px "Courier New", monospace`;
    lineas = [];
    versos.forEach((v, i) => {
      const envueltas = envolverTexto(ctx, v.trim(), maxAnchoTexto);
      lineas.push(...envueltas);
      if (esHaiku && i < versos.length - 1) lineas.push(''); // línea en blanco entre versos del haiku
    });
    tamañoFuente -= 2;
  } while (lineas.length * (tamañoFuente + 2) * 1.5 > ALTO * 0.5 && tamañoFuente > 24);

  const lh = tamañoFuente * 1.55;
  const bloqueAltura = lineas.length * lh;
  let y = ALTO / 2 - bloqueAltura / 2 + tamañoFuente / 2;

  ctx.fillStyle = '#f4f4f4';
  ctx.font = `${tamañoFuente}px "Courier New", monospace`;
  ctx.shadowColor = 'rgba(255,107,53,0.35)';
  ctx.shadowBlur = 18;
  lineas.forEach(linea => {
    ctx.fillText(linea, ANCHO / 2, y);
    y += lh;
  });
  ctx.shadowBlur = 0;

  // autor
  ctx.fillStyle = '#ff6b35';
  ctx.font = '28px "Courier New", monospace';
  ctx.fillText(`— ${autor}`, ANCHO / 2, y + 20);

  // pie
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '20px "Courier New", monospace';
  ctx.fillText('39913em.github.io/jardin-del-oraculo', ANCHO / 2, ALTO - 60);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
}
