# Sprites de Estela y Lumi

## Formato de ejecución

Los personajes se cargan como tres atlas PNG transparentes de 1536×1024 con metadatos JSON para Phaser. Cada secuencia contiene seis frames y conserva un punto de anclaje estable.

- Estela: origen inferior central `(0.5, 1)` para mantener los pies sobre la misma línea.
- Lumi: origen central `(0.5, 0.5)` y posición relativa al hombro de Estela.
- Los efectos mágicos forman parte de su secuencia específica y no modifican el tamaño del resto de animaciones.

Los archivos de ejecución están en `public/assets/characters/estela/`.

## Animaciones

| Estado | Clave Phaser | FPS | Repetición | Uso actual |
|---|---|---:|---|---|
| Idle | `estela-idle` | 6 | Bucle | Portada y partida |
| Caminar | `estela-walk` | 10 | Bucle | Preparada para futuro |
| Correr | `estela-run` | 14 | Bucle | Preparada para futuro |
| Saltar | `estela-jump` | 12 | Una vez | Preparada para futuro |
| Caer | `estela-fall` | 8 | Bucle | Preparada para futuro |
| Aterrizar | `estela-land` | 12 | Una vez | Preparada para futuro |
| Celebrar | `estela-celebrate` | 10 | Bucle | Nivel superado y final |
| Daño | `estela-damage` | 10 | Una vez | Preparada para futuro |
| Magia | `estela-magic` | 12 | Una vez | Cada intento de captura |
| Lumi flotando | `lumi-idle` | 8 | Bucle | Portada y partida |
| Lumi reacciona | `lumi-react` | 12 | Una vez | Intento de captura |
| Lumi celebra | `lumi-celebrate` | 12 | Bucle | Nivel superado y final |

## Integración

`EstelaRig` agrupa a Estela y Lumi para que escala, profundidad y posición sean coherentes entre escenas. Las acciones puntuales vuelven automáticamente a `idle`; caminar, correr, saltar, caer, aterrizar y daño quedan disponibles mediante `rig.play(...)` cuando se incorporen esas mecánicas.

El hada que aparece al superar niveles continúa siendo un personaje distinto de Lumi.
