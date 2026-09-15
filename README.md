# Jardín del Oráculo

Pieza digital interactiva independiente de 39913.

## Entrada

La URL canónica del proyecto en GitHub Pages es:

`https://39913em.github.io/jardin-del-oraculo/`

`index.html` contiene directamente la pieza y es la única entrada del Jardín. No existe un segundo archivo de entrada para evitar duplicidad y confusión.

## Estructura

- `index.html` — pieza interactiva.
- `about.html` — información del proyecto.
- `terminos.html` — términos propios.
- `privacidad.html` — privacidad propia.
- `404.html` — página 404 propia.
- `manifest.webmanifest` — instalación como app.
- `sw.js` — Service Worker limitado al mismo origen.
- `preview.jpg` — preview propio.
- `assets/img/` — identidad visual del Jardín.
- `src/` — lógica original de la pieza.

## Nota técnica

La lógica de `src/` se conserva. No requiere build. Utiliza módulos ES, Three.js vía CDN y Firebase Realtime Database.

El Service Worker no intercepta recursos de otros dominios, por lo que Firebase, Three.js y otros CDN siguen funcionando desde la red.
