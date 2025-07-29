# Documentación del Sistema de Juego Interactivo de Ecuador

## 📖 Descripción General

El **Juego Interactivo de Ecuador** es una aplicación educativa que combina tecnología web moderna con hardware Arduino para crear una experiencia de aprendizaje inmersiva sobre la geografía ecuatoriana. Los jugadores responden preguntas sobre las 24 provincias de Ecuador utilizando un mapa físico interactivo.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Frontend React** - Interfaz de usuario y lógica del juego
2. **Backend Python** - API REST con Machine Learning
3. **Hardware Arduino** - Mapa físico interactivo con botones
4. **Base de Datos** - Almacenamiento de datos del juego

## 🎮 Mecánicas del Juego

### Flujo de una Partida

1. **Inicio**: El jugador ingresa nombre y edad
2. **Selección**: Se eligen 10 preguntas aleatorias de 48 disponibles
3. **Juego**: Por cada pregunta:
   - Se muestra la pregunta y pista
   - Se reproduce audio con TTS
   - El jugador tiene tiempo limitado para responder
   - Debe presionar el botón correcto en el mapa físico
4. **Puntuación**: Sistema inteligente basado en ML
5. **Final**: Pantalla de resultados y leaderboard

### Sistema de Vidas
- **3 vidas por partida**
- Se pierde una vida por respuesta incorrecta o tiempo agotado
- Las vidas se restauran al responder correctamente
- El juego termina al quedarse sin vidas

## 🗺️ Mapeo de Provincias

### Numeración Oficial (0-23)

```javascript
0  - Carchi                    12 - Loja
1  - Sucumbíos                 13 - Cañar
2  - Orellana                  14 - El Oro
3  - Imbabura                  15 - Bolívar
4  - Napo                      16 - Guayas
5  - Cotopaxi                  17 - Los Ríos
6  - Pastaza                   18 - Santa Elena
7  - Morona Santiago           19 - Santo Domingo de los Tsáchilas
8  - Azuay                     20 - Esmeraldas
9  - Chimborazo                21 - Pichincha
10 - Zamora Chinchipe          22 - Galápagos
11 - Tungurahua               23 - Manabí
```

## 🎲 Sistema de Preguntas Aleatorias

### Banco de Preguntas
- **48 preguntas totales** (2 por provincia)
- **10 preguntas por partida** (selección aleatoria)
- **Diversidad garantizada** en cada partida

### Estructura de Pregunta
```javascript
{
  id: 1,
  province: "Azuay",
  question: "¿Dónde está Cuenca, la ciudad con casas de colores?",
  hint: "Esta provincia está en la sierra sur y su capital es Cuenca.",
  gameIndex: 0,           // Posición en el juego (0-9)
  provinceNumber: 8,      // Número oficial de la provincia
  correctAnswer: 8        // Respuesta esperada del Arduino
}
```

## 🤖 Sistema de Machine Learning

### Factores de Puntuación
- **Tiempo de respuesta**: Menor tiempo = mayor puntuación
- **Corrección**: Respuesta correcta vs incorrecta
- **Progreso**: Número de pregunta actual
- **Dificultad**: Vidas restantes
- **Adaptabilidad**: Edad del jugador

### API del Modelo
```javascript
POST /api/score
{
  currentQuestion: 3,
  responseTime: 12.5,
  isCorrect: true,
  livesRemaining: 2,
  playerAge: 10
}
```

## 🔌 Integración con Arduino

### Protocolo de Comunicación
- **WebSocket** para comunicación en tiempo real
- **Formato de mensaje**: Número del botón presionado (0-23)
- **Validación**: Comparación con respuesta correcta esperada

### Flujo de Respuesta
1. Jugador presiona botón en mapa físico
2. Arduino envía número via WebSocket
3. Sistema valida respuesta
4. Se procesa resultado (correcto/incorrecto)

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── screens/
│   │   ├── StartScreen.jsx          # Pantalla de inicio
│   │   ├── PlayerInfoScreen.jsx     # Captura de datos del jugador
│   │   ├── GameScreen.jsx           # Pantalla principal del juego
│   │   ├── FeedbackScreen.jsx       # Retroalimentación de respuestas
│   │   └── FinishedScreen.jsx       # Pantalla de resultados
│   ├── TTSButton.jsx                # Componente de Text-to-Speech
│   └── Leaderboard.jsx              # Tabla de puntuaciones
├── context/
│   └── GameContext.jsx              # Estado global del juego
├── data/
│   ├── questions.js                 # Banco de preguntas
│   └── provinceMapping.js           # Mapeo y utilidades
├── services/
│   └── api.js                       # Cliente de API
└── utils/
    └── elevenLabsManager.js         # Gestión de TTS
```

## 🔧 Estados del Juego

### Estados Posibles
- `"start"` - Pantalla de inicio
- `"playerInfo"` - Captura de datos del jugador
- `"playing"` - Juego activo
- `"correct"` - Respuesta correcta (transición)
- `"incorrect"` - Respuesta incorrecta (transición)
- `"finished"` - Juego terminado

### Transiciones
```
start → playerInfo → playing ⇄ correct/incorrect → finished
```

## 🎵 Sistema de Audio (TTS)

### Características
- **Texto a voz** para preguntas y pistas
- **Soporte multiidioma** (español)
- **Control de reproducción** (play/pause/stop)
- **Integración** con ElevenLabs API

### Contenido del Audio
```
"[Pregunta]. Pista: [Pista]. 
Busca la provincia en tu mapa y selecciónala. 
Tú puedes [NombreJugador]."
```

## 📊 Métricas y Analytics

### Datos Recopilados
- Tiempo de respuesta por pregunta
- Precisión por provincia
- Progreso del jugador
- Patrones de error
- Efectividad del sistema de pistas

### Logging del Sistema
```javascript
🎲 Preguntas seleccionadas para el juego
🎮 Arduino input: botón X, respuesta correcta: Y
✅ Respuesta correcta del Arduino
❌ Respuesta incorrecta del Arduino
📊 Enviando datos al backend
🤖 Puntaje de esta pregunta: X puntos
```

## 🚀 Instalación y Configuración

### Requisitos
- Node.js 16+
- Python 3.8+
- Arduino IDE
- WebSocket server

### Variables de Entorno
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ELEVENLABS_API_KEY=your_key_here
REACT_APP_WEBSOCKET_URL=ws://localhost:8080
```

## 🔮 Extensibilidad

### Agregar Nuevas Provincias
1. Actualizar `provinceMapping.js`
2. Añadir preguntas en `questions.js`
3. Configurar botón en hardware Arduino

### Nuevas Funcionalidades
- **Modo multijugador**: Competencia entre jugadores
- **Niveles de dificultad**: Fácil, medio, difícil
- **Temas adicionales**: Cultura, historia, gastronomía
- **Realidad aumentada**: Overlays informativos

## 📋 Testing y Simulación

### Botones de Simulación
El `GameScreen` incluye botones para simular respuestas del Arduino:
- **Botón Correcto**: Simula presionar la respuesta correcta
- **Botón Incorrecto**: Simula respuesta incorrecta

### Logs de Debug
El sistema incluye logging extensivo para facilitar el desarrollo y debugging.

---

**Desarrollado para promover el aprendizaje interactivo de la geografía ecuatoriana** 🇪🇨
