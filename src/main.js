
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js';

import { iniciarCriaturas, actualizarCriaturas } from './criaturas.js';
import { crearParticulas } from './particulas.js';
import { crearVegetacion } from './vegetacion.js';
import { crearFondo } from './fondo.js';
import { crearColumnas, activarRuina as activarRuinaColumnas, desactivarRuina as desactivarRuinaColumnas } from './columnas.js';
import { crearTerreno } from './terreno.js';

import {
  ESTADO,
  actualizarUI,
  cambiarVida,
  avisoTemporal,
  escucharEstado,
  cargarEstado,
  setSincronizarFlores,
  setRuinaHandlers,
  setMensajesHandlers
} from './estado-jardin.js';

import { sincronizarFlores } from './flores.js';
import { escucharVerso, escucharMensajes, limpiarMensajesFlotantes } from './flotantes.js';

import { initAudio } from './sonido.js';

import { configurarBotones } from './ui-botones.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const cambiarVidaOriginal = cambiarVida;

export function cambiarVidaConEscena(cantidad) {
  cambiarVidaOriginal(cantidad);
  sincronizarFlores();
  actualizarUI();
}

export { cambiarVidaConEscena as cambiarVida };

async function iniciarTodo() {
  console.log('🚀 Iniciando Jardín del Oráculo...');

  setRuinaHandlers(activarRuinaColumnas, desactivarRuinaColumnas);
  setMensajesHandlers(limpiarMensajesFlotantes);


  const cargaEstado = cargarEstado();

  crearColumnas();
  crearTerreno();
  crearParticulas();
  crearVegetacion();
  crearFondo();

  await cargaEstado;
  console.log('✅ Estado OK, vida:', ESTADO.vida);

  sincronizarFlores();
  setSincronizarFlores(sincronizarFlores);
  iniciarCriaturas();
  escucharEstado();
  escucharVerso();
  escucharMensajes();
  initAudio();
  configurarBotones();

  console.log('🌿 Jardín OK.');
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarTodo().catch(err => {
    console.error('❌ Error al iniciar el jardín:', err);
    avisoTemporal('Error al cargar el jardín.');
  });
});

export { actualizarCriaturas };
export { db, app };

if (new URLSearchParams(location.search).get('fps') === '1') {
  const hud = document.getElementById('fps-hud');
  if (hud) {
    hud.style.display = 'block';
    let frames = 0;
    let last = performance.now();
    function loop() {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        hud.textContent = `FPS: ${frames} · ${(1000 / (now - last) * frames).toFixed(0)}`;
        frames = 0;
        last = now;
      }
      requestAnimationFrame(loop);
    }
    loop();
  }
}

import './modal-legal.js';