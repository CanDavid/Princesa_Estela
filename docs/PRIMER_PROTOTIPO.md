# Primer prototipo de Princesa Estela

## Decisiones implementadas

- Juego web táctil en español para Ona y Pau, con Estela y su cazamariposas.
- Orientación horizontal; en vertical se pide girar el dispositivo.
- Tocar una posición hace que Estela lance la red hacia allí.
- Acertar captura al bicho suma una estrella y reproduce una celebración visual y sonora.
- Fallar no resta puntos ni vidas y no existe límite de tiempo.
- Escenario original con castillo, camino, árboles, flores y fuente, siguiendo los dibujos.
- Tres niveles en el mismo escenario con objetivos de 5, 8 y 12 capturas y dificultad creciente.
- Tras los niveles 1 y 2 aparece el hada con el botón «Siguiente nivel».
- El tercer nivel termina con «¡Aventura completada!» y permite volver a jugar.
- Música y efectos originales con control para silenciarlos durante la sesión.
- Estela usa sprites animados consistentes y Lumi la acompaña en todas las escenas.
- La magia de Estela anticipa el lanzamiento del cazamariposas sin alterar el control por toque.

## Controles

- **Pantalla táctil o ratón:** tocar o pulsar cerca de un bicho para lanzar la red.
- **INICIO:** comienza la partida y permite al navegador activar el audio.
- **Sonido:** botón de altavoz en la esquina superior derecha.
- **Botones:** también accesibles mediante teclado.

## Progresión

| Nivel | Capturas | Bichos simultáneos | Velocidad |
|---|---:|---:|---:|
| 1 | 5 | 3 | 95–135 px/s |
| 2 | 8 | 4 | 135–190 px/s |
| 3 | 12 | 5 | 190–250 px/s |

## Validación familiar pendiente

- Probar el tamaño real de las zonas de captura en móvil y tablet.
- Los bichos vuelan más rápido, aparecen antes y aumentan en número en cada nivel.
- Toda la interfaz visible utiliza mayúsculas para facilitar la lectura de Ona.
- Ajustar volumen y frecuencia de los sonidos después de una partida completa.

## Fuera de esta versión

No incluye selección de personaje, villano, jefe final, vidas, cronómetro, guardado de progreso ni una composición específica para pantalla vertical.

Estado: primera versión jugable implementada; pendiente de pruebas con la familia.
