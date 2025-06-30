# Ecuador Interactivo

Un juego interactivo para aprender sobre las provincias del Ecuador.

## Características

- **Juego de preguntas**: Aprende sobre las provincias del Ecuador
- **Text-to-Speech**: Escucha las preguntas dictadas por una voz natural y amigable
- **Interfaz interactiva**: Diseño moderno y responsivo
- **Sistema de vidas**: Mecánica de juego enganchante
- **Puntuación**: Sistema de puntos y progreso

## Configuración

### Requisitos previos
- Node.js instalado
- Cuenta de ElevenLabs para TTS (opcional)

### Instalación

```bash
npm install
```

### Configuración de Text-to-Speech (Opcional)

1. Crea una cuenta en [ElevenLabs](https://elevenlabs.io/)
2. Obtén tu API key
3. Actualiza el archivo `.env` con tu API key:

```env
VITE_ELEVENLABS_API_KEY=tu_api_key_aqui
```

### Ejecutar el proyecto

```bash
npm run dev
```

## Características del Text-to-Speech

- **Auto-reproducción**: Las preguntas se reproducen automáticamente cuando aparecen
- **Control manual**: Botón para reproducir/detener audio manualmente
- **Prevención de duplicación**: Sistema inteligente que evita múltiples audios simultáneos
- **Feedback visual**: Indicadores de carga y reproducción
- **Responsive**: Funciona en dispositivos móviles y desktop

## Tecnologías utilizadas

- React + Vite
- ElevenLabs AI (Text-to-Speech)
- Material-UI
- Tailwind CSS
- Lucide React (iconos)
