# Primer prototipo de Princesa Estela

## Decisiones implementadas

- Juego web táctil en español para Ona y Pau, con Estela y su cazamariposas.
- Orientación horizontal; en vertical se pide girar el dispositivo.
- Tocar una posición hace que Estela lance la red hacia allí.
- Capturar una caca marrón suma al objetivo; capturar una morada suma puntos Bowser.
- El límite Bowser equivale al 50 % del objetivo marrón y en cada enjambre aparecen dos moradas adicionales.
- Alcanzar el límite muestra una derrota y permite reintentar el nivel con los marcadores reiniciados.
- Fallar no resta puntos ni vidas y no existe límite de tiempo.
- Escenario original con castillo, camino, árboles, flores y fuente, siguiendo los dibujos.
- Nueve niveles de enjambre con objetivos de 12 a 28 capturas y dificultad creciente.
- Todas las cacas de cada enjambre están presentes desde el inicio; no reaparecen después de capturarlas.
- Tras los niveles 1 a 9 aparece el hada con el botón «¡A por el siguiente nivel!».
- El nivel 10 enfrenta a Estela con una caca gigante que necesita cinco impactos mágicos y cinco secuaces morados; tres puntos Bowser provocan la derrota.
- El jefe permite elegir entre hechizos de estrella, rayo y arcoíris.
- El décimo nivel termina con «¡Aventura completada!» y permite volver a jugar.
- Un cronómetro muestra el tiempo acumulado y las celebraciones enseñan el tiempo del nivel y del juego. Conserva los intentos fallidos y se pausa en sus pantallas de derrota.
- Música y efectos originales con control para silenciarlos durante la sesión.
- Estela usa sprites animados consistentes y Lumi la acompaña en todas las escenas.
- La magia de Estela anticipa el lanzamiento del cazamariposas sin alterar el control por toque.

## Controles

- **Pantalla táctil o ratón:** tocar o pulsar cerca de un bicho para lanzar la red.
- **INICIO:** comienza la partida y permite al navegador activar el audio.
- **Sonido:** botón de altavoz en la esquina superior derecha.
- **Botones:** también accesibles mediante teclado.

## Progresión

| Nivel | Objetivo marrón | Moradas | Límite Bowser | Velocidad |
|---|---:|---:|---:|---:|
| 1 | 12 | 8 | 6 | 190–250 px/s |
| 2 | 14 | 9 | 7 | 230–300 px/s |
| 3 | 16 | 10 | 8 | 270–350 px/s |
| 4 | 18 | 11 | 9 | 315–410 px/s |
| 5 | 20 | 12 | 10 | 360–470 px/s |
| 6 | 22 | 13 | 11 | 410–540 px/s |
| 7 | 24 | 14 | 12 | 470–620 px/s |
| 8 | 26 | 15 | 13 | 540–720 px/s |
| 9 | 28 | 16 | 14 | 620–840 px/s |
| 10 | 5 hechizos al jefe | 5 | 3 | 145–210 px/s |

## Validación familiar pendiente

- Probar el tamaño real de las zonas de captura en móvil y tablet.
- Los bichos vuelan más rápido, aparecen antes y aumentan en número en cada nivel.
- Toda la interfaz visible utiliza mayúsculas para facilitar la lectura de Ona.
- Ajustar volumen y frecuencia de los sonidos después de una partida completa.

## Fuera de esta versión

No incluye selección de personaje, vidas, guardado de progreso ni una composición específica para pantalla vertical.

Estado: primera versión jugable implementada; pendiente de pruebas con la familia.
