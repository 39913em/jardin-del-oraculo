# Jardín del Oráculo

Pieza digital interactiva independiente, separada del repositorio del blog
**Archivo de Señal** (https://39913em.github.io/archivo-de-senal/).

Es un sitio estático (HTML + módulos JS con Three.js vía CDN + Firebase
Realtime Database para el estado compartido del jardín). No requiere build
ni servidor propio.

## Estructura

```
jardin-del-oraculo/
├── index.html          → redirige a jardin.html (para que la raíz del repo funcione)
├── jardin.html          → la pieza en sí (HTML, CSS inline, referencias)
├── favicon.webp
├── preview.jpg          → imagen usada en Open Graph / Twitter cards
├── oembed.json
├── _headers             → headers de seguridad (Netlify/Cloudflare Pages)
└── src/
    ├── main.js           → punto de entrada (importado como module en jardin.html)
    ├── estado-jardin.js  → estado global + conexión a Firebase
    ├── firebase-config.js
    ├── escena-3d.js      → escena Three.js
    ├── columnas.js
    ├── criaturas.js
    ├── datos.js
    ├── flores.js
    ├── flotantes.js
    ├── fondo.js
    ├── particulas.js
    ├── sonido.js
    ├── terreno.js
    ├── ui-botones.js
    ├── utils.js
    └── vegetacion.js
```

## Despliegue (GitHub Pages)

1. Crea el repo `jardin-del-oraculo` en GitHub (público).
2. Sube todo el contenido de esta carpeta a la raíz del repo.
3. Settings → Pages → Branch `main` → Save.
4. El sitio queda en `https://39913em.github.io/jardin-del-oraculo/`.

## Relación con el blog

Los enlaces de "Privacidad", "Términos" y "← Volver al inicio" dentro de
`jardin.html` apuntan de forma absoluta al repo del blog
(`https://39913em.github.io/archivo-de-senal/...`), en vez de tener copias
propias. Así ambos proyectos comparten una sola fuente de verdad para esas
páginas legales y no hay que mantenerlas duplicadas en dos repos. Si algún
día el jardín deja de vivir bajo el mismo autor/dominio, solo hay que
actualizar esas tres URLs en `jardin.html` (buscar
`archivo-de-senal` dentro del archivo).

## Notas

- `firebase-config.js` contiene la configuración pública del cliente de
  Firebase (no es una clave secreta de servidor); se copió tal cual estaba
  en el repo original.
- No se modificó ninguna lógica de `src/`, solo se movió de carpeta.
