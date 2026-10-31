# Princesa Estela

Juego web táctil infantil creado para Ona y Pau. Ayuda a Estela a capturar cacas voladoras y a derrotar un jefe final a lo largo de diez niveles, sin vidas ni penalizaciones.

Estela utiliza su diseño animado oficial y está acompañada por Lumi, una estrella flotante que reacciona a la magia y celebra cada nivel.

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
2. Captura todas las cacas marrones y evita las cacas Bowser moradas.
3. El HUD muestra los puntos Bowser actuales y el límite del nivel. Al alcanzar ese límite se pierde el nivel.
4. Pulsa **REINTENTAR NIVEL** para empezar de nuevo sin borrar el tiempo de los intentos anteriores.
5. En los niveles 1 a 9, todas las cacas están presentes desde el principio y cada captura deja una menos.
6. En el nivel 10, elige un hechizo, acierta cinco veces a la caca gigante y evita sus cinco secuaces morados.
7. Pulsa **¡A POR EL SIGUIENTE NIVEL!** tras superar los niveles 1 a 9.

El cronómetro del HUD mide el tiempo de juego. Cada celebración muestra el tiempo del nivel y el acumulado de la aventura; las pausas, las pantallas de derrota y el tiempo esperando en la celebración no cuentan.

La música y los efectos se pueden silenciar en cualquier momento. La partida comienza de nuevo al recargar la página.

## Publicación

La compilación usa la ruta `/Princesa_Estela/`. El workflow `Comprobar y publicar en GitHub Pages` valida y publica el sitio al actualizar `main`, y también puede iniciarse manualmente desde GitHub Actions. En la configuración del repositorio, Pages debe usar **GitHub Actions** como origen.

El escenario y los personajes son recursos originales del proyecto. Los dibujos de la familia se conservan en `docs/referencias/` como origen creativo.

La especificación de sprites, anclajes y animaciones está documentada en `docs/SPRITES_ESTELA.md`.
