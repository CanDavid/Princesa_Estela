# Primer prototipo de Princesa Estela

## Decisiones implementadas

- Juego web táctil en español para Ona y Pau, con Estela y su cazamariposas.
- Orientación horizontal; en vertical se pide girar el dispositivo.
- Tocar una posición hace que Estela lance la red hacia allí.
- Acertar captura al bicho suma una estrella y reproduce una celebración visual y sonora.
- Fallar no resta puntos ni vidas y no existe límite de tiempo.
- Escenario original con castillo, camino, árboles, flores y fuente, siguiendo los dibujos.
- Nueve niveles de enjambre con objetivos de 12 a 28 capturas y dificultad creciente.
- Todas las cacas de cada enjambre están presentes desde el inicio; no reaparecen después de capturarlas.
- Tras los niveles 1 a 9 aparece el hada con el botón «¡A por el siguiente nivel!».
- El nivel 10 enfrenta a Estela con una caca gigante que necesita cinco impactos mágicos.
- El jefe permite elegir entre hechizos de estrella, rayo y arcoíris.
- El décimo nivel termina con «¡Aventura completada!» y permite volver a jugar.
- Un cronómetro muestra el tiempo acumulado y las celebraciones enseñan el tiempo del nivel y del juego.
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
| 1 | 12 | 12 | 190–250 px/s |
| 2 | 14 | 14 | 230–300 px/s |
| 3 | 16 | 16 | 270–350 px/s |
| 4 | 18 | 18 | 315–410 px/s |
| 5 | 20 | 20 | 360–470 px/s |
| 6 | 22 | 22 | 410–540 px/s |
| 7 | 24 | 24 | 470–620 px/s |
| 8 | 26 | 26 | 540–720 px/s |
| 9 | 28 | 28 | 620–840 px/s |
| 10 | 5 hechizos | 1 jefe gigante | 145–210 px/s |

## Validación familiar pendiente

- Probar el tamaño real de las zonas de captura en móvil y tablet.
- Los bichos vuelan más rápido, aparecen antes y aumentan en número en cada nivel.
- Toda la interfaz visible utiliza mayúsculas para facilitar la lectura de Ona.
- Ajustar volumen y frecuencia de los sonidos después de una partida completa.

## Fuera de esta versión

No incluye selección de personaje, villano, jefe final, vidas, cronómetro, guardado de progreso ni una composición específica para pantalla vertical.

Estado: primera versión jugable implementada; pendiente de pruebas con la familia.
