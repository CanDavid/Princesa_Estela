# Princesa Estela

Juego web táctil infantil creado para Ona y Pau. Ayuda a Estela a capturar bichitos voladores con su cazamariposas a lo largo de tres niveles, sin vidas, tiempo ni penalizaciones.

## Jugar y desarrollar

Requiere Node.js 22 o posterior.

```bash
npm ci
npm run dev
```

El servidor de desarrollo muestra la dirección local. El juego está pensado para móvil o tablet en horizontal, aunque también admite ratón y teclado en los botones.

Otros comandos:

```bash
npm run typecheck  # Comprueba TypeScript
npm test           # Pruebas unitarias
npm run test:e2e   # Flujo completo en Chromium; CI añade WebKit móvil
npm run build      # Compilación de producción en dist/
npm run check      # Tipos, pruebas y compilación
```

## Cómo se juega

1. Pulsa **INICIO** para activar el sonido y empezar.
2. Toca un bichito para que Estela lance la red hacia él.
3. Cada captura suma una estrella. Fallar no resta nada.
4. Consigue 5, 8 y 12 estrellas para completar los tres niveles.

La música y los efectos se pueden silenciar en cualquier momento. La partida comienza de nuevo al recargar la página.

## Publicación

La compilación usa la ruta `/Princesa_Estela/`. El workflow `Comprobar y publicar en GitHub Pages` valida y publica el sitio al actualizar `main`, y también puede iniciarse manualmente desde GitHub Actions. En la configuración del repositorio, Pages debe usar **GitHub Actions** como origen.

El escenario y los personajes son recursos originales del proyecto. Los dibujos de la familia se conservan en `docs/referencias/` como origen creativo.
