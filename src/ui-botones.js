import { rand, sanitizar, verificarRateLimit, ajustarSilabas, idsVistos, lexicoActivo } from './utils.js';
import { 
  ESTADO, 
  cambiarVida, 
  revivirOráculo, 
  avisoTemporal, 
  guardarEstado,
  actualizarUI 
} from './estado-jardin.js';
import { 
  datosColumna, 
  LEXICO_INICIAL,
  CONFIG 
} from './datos.js';
import { 
  crearVerso, 
  crearMensaje
} from './flotantes.js';
import { db } from './main.js';
import { ref, get, set, push } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js';
import { playPageTurn } from './sonido.js';
import { generarTarjetaCompartir } from './tarjeta-compartir.js';

let LEXICO_APROBADO = { señal:[], resonancia:[], fractura:[], deriva:[] };

async function sembrar() {
  if (!verificarRateLimit()) return;

  if (ESTADO.muerto) {
    await revivirOráculo('semilla');
    return;
  }

  ESTADO.vecesCompartido += 1;
  await guardarEstado();
  actualizarUI();
  avisoTemporal(`Semilla sembrada (${ESTADO.vecesCompartido})`);
}

let urlTarjetaActual = null; // se revoca cada vez que se genera una nueva, para no acumular memoria

export function generarBotonesCompartir(texto, autor, esSemilla = true) {
  console.log('🔍 generarBotonesCompartir llamado con:', { texto, autor, esSemilla }); // ← PARA DEPURAR

  const msg = esSemilla ? `"Sembrar una semilla en el Jardín" — ${autor}` : `"${texto}" — ${autor}`;

  // --- TARJETA DE IMAGEN (estilo "compartir canción" de Spotify) ---
  // Único método de compartir: se genera una imagen real con el haiku/plegaria
  // adentro y se ofrece compartirla (share sheet nativo) o descargarla.
  const textoTarjeta = esSemilla ? 'Sembrar una semilla en el Jardín' : texto;
  const previewImg = document.getElementById('verso-compartir-imagen');
  const accionesImg = document.getElementById('tarjeta-compartir-acciones');
  if (previewImg) previewImg.removeAttribute('src');
  if (accionesImg) accionesImg.innerHTML = '<span style="color:#666;font-size:10px">Generando imagen…</span>';

  generarTarjetaCompartir(textoTarjeta, autor, esSemilla ? 'semilla' : 'verso').then(blob => {
    if (!blob) { if (accionesImg) accionesImg.innerHTML = ''; return; }
    if (urlTarjetaActual) URL.revokeObjectURL(urlTarjetaActual);
    urlTarjetaActual = URL.createObjectURL(blob);

    if (previewImg) previewImg.src = urlTarjetaActual;
    if (!accionesImg) return;
    accionesImg.innerHTML = '';

    const archivo = new File([blob], 'jardin-del-oraculo.png', { type: 'image/png' });
    const puedeCompartirArchivo = navigator.canShare && navigator.canShare({ files: [archivo] });

    if (puedeCompartirArchivo) {
      const btnCompartir = document.createElement('button');
      btnCompartir.textContent = '📤 Compartir imagen';
      btnCompartir.setAttribute('style', 'padding:8px 16px;border-radius:20px;border:none;background:#ff6b35;color:#0a0a0a;font-size:11px;font-weight:bold;cursor:pointer;font-family:inherit;');
      btnCompartir.addEventListener('click', async () => {
        try {
          await navigator.share({ files: [archivo], title: 'Jardín del Oráculo', text: msg });
          sembrar();
        } catch (e) { /* el usuario canceló el share sheet: no es un error */ }
      });
      accionesImg.appendChild(btnCompartir);
    }

    const btnDescargar = document.createElement('a');
    btnDescargar.textContent = puedeCompartirArchivo ? 'Descargar' : '⬇ Descargar imagen';
    btnDescargar.href = urlTarjetaActual;
    btnDescargar.download = 'jardin-del-oraculo.png';
    btnDescargar.setAttribute('style', `padding:8px 16px;border-radius:20px;text-decoration:none;font-size:11px;font-weight:bold;font-family:inherit;cursor:pointer;${puedeCompartirArchivo ? 'border:1px solid #555;color:#ccc;background:transparent;' : 'border:none;background:#ff6b35;color:#0a0a0a;'}`);
    btnDescargar.addEventListener('click', () => sembrar());
    accionesImg.appendChild(btnDescargar);
  });

  const textoEl = document.getElementById('verso-compartir-texto');
  const autorEl = document.getElementById('verso-compartir-autor');
  if (textoEl) textoEl.textContent = esSemilla ? '"Sembrar una semilla en el Jardín"' : `"${texto}"`;
  if (autorEl) autorEl.textContent = `— ${autor}`;

  const panel = document.getElementById('panel-compartir');
  if (panel) panel.classList.add('visible');
}

async function guardarLexicoAprobado(categoria, palabra) {
  try {
    const key = Date.now()+'_'+Math.floor(Math.random()*1000);
    const refNodo = ref(db, `lexico_aprobado/${categoria}/${key}`);
    await set(refNodo, palabra);
    LEXICO_APROBADO[categoria].push(palabra);
  } catch(e) { console.warn('No se pudo guardar palabra en léxico:', e); }
}

async function haiku() {
  if (ESTADO.muerto) {
    ESTADO.haikusParaRevivir = (ESTADO.haikusParaRevivir || 0) + 1;
    if (ESTADO.haikusParaRevivir >= CONFIG.HAUKUS_PARA_REVIVIR) {
      await revivirOráculo('haikus');
    } else {
      avisoTemporal(`💀 ${CONFIG.HAUKUS_PARA_REVIVIR} haikus reviven (${ESTADO.haikusParaRevivir}/${CONFIG.HAUKUS_PARA_REVIVIR})`);
    }
    return;
  }

  function generarHaiku(label) {
    let v1 = rand(lexicoActivo('señal', LEXICO_INICIAL, LEXICO_APROBADO));
    v1 = ajustarSilabas(v1, 5);

    let v2 = rand(lexicoActivo('resonancia', LEXICO_INICIAL, LEXICO_APROBADO));
    v2 = ajustarSilabas(v2, 7);

    let v3 = rand(lexicoActivo('fractura', LEXICO_INICIAL, LEXICO_APROBADO));
    v3 = ajustarSilabas(v3, 5);

    return { texto: `${v1} / ${v2} / ${v3}`, autor: 'ORÁCULO', columna: label, cat: 'haiku' };
  }

  const col = datosColumna[Math.floor(Math.random() * datosColumna.length)];
  let verso = generarHaiku(col.label);
  let intentos = 0;

  while (idsVistos.has(verso.texto) && intentos < 50) {
    verso = generarHaiku(col.label);
    intentos++;
  }

  if (intentos >= 50) {
    idsVistos.clear();
    verso = generarHaiku(col.label);
  }

  crearVerso(verso.texto, verso.autor, col.label);

  try {
    const nuevoVerso = {
      texto: verso.texto, autor: verso.autor,
      columna: col.label, ts: Date.now()
    };
    const refPush = push(ref(db, 'versos'), nuevoVerso);
    idsVistos.add(verso.texto);
  } catch(e) { console.warn('No se pudo sincronizar:', e); }

  cambiarVida(1);
  playPageTurn();
}

export function configurarBotones() {
  const btnSembrar = document.getElementById('btn-sembrar');
  if (btnSembrar) {
    btnSembrar.addEventListener('click', () => {
      generarBotonesCompartir('', 'ORÁCULO', true);
    });
  }

  const btnPoesia = document.getElementById('btn-poesia');
  if (btnPoesia) {
    btnPoesia.addEventListener('click', haiku);
  }

  const btnPlegaria = document.getElementById('btn-plegaria');
  const inputPlegaria = document.getElementById('input-plegaria');
  const cerrarPlegaria = document.getElementById('cerrar-plegaria');
  const enviarPlegaria = document.getElementById('enviar-plegaria');
  const mensajePlegaria = document.getElementById('mensaje-plegaria');

  if (btnPlegaria) {
    btnPlegaria.addEventListener('click', () => {
      if (ESTADO.muerto) {
        avisoTemporal('El jardín está muerto.');
        return;
      }
      if (inputPlegaria) inputPlegaria.classList.toggle('visible');
    });
  }

  if (cerrarPlegaria) {
    cerrarPlegaria.addEventListener('click', () => {
      if (inputPlegaria) inputPlegaria.classList.remove('visible');
    });
  }

  if (enviarPlegaria && mensajePlegaria) {
    enviarPlegaria.addEventListener('click', async () => {
      const t = sanitizar(mensajePlegaria.value.trim());
      if (!t) return;

      const cat = ['señal', 'resonancia', 'fractura', 'deriva'][Math.floor(Math.random() * 4)];
      await guardarLexicoAprobado(cat, t);
      ESTADO.mensajes = [...ESTADO.mensajes, t];
      await guardarEstado();
      crearMensaje(t);

      mensajePlegaria.value = '';
      if (inputPlegaria) inputPlegaria.classList.remove('visible');
      
      playPageTurn();
      avisoTemporal('Palabra añadida al oráculo');
    });
  }

  const btnInstrucciones = document.getElementById('btn-instrucciones');
  const panelInstrucciones = document.getElementById('panel-instrucciones');
  if (btnInstrucciones && panelInstrucciones) {
    btnInstrucciones.addEventListener('click', () => {
      panelInstrucciones.classList.add('visible');
    });
  }

  const cerrarCompartir = document.querySelector('#panel-compartir .btn-cerrar-panel');
  if (cerrarCompartir) {
    cerrarCompartir.addEventListener('click', () => {
      document.getElementById('panel-compartir')?.classList.remove('visible');
    });
  }

  console.log('🖱️ BotonesUI OK.');
}