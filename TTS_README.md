# 🎵 Configuración del Text-to-Speech (TTS)

Este proyecto usa **ElevenLabs** para generar audio de alta calidad en español, con fallback al TTS del navegador si hay problemas.

## ⚙️ Configuración

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

### 2. API Key de ElevenLabs

1. Ve a [ElevenLabs](https://elevenlabs.io/app/speech-synthesis/text-to-speech)
2. Crea una cuenta o inicia sesión
3. Ve a tu perfil → API Keys
4. Crea una nueva API key
5. Copia la API key en tu archivo `.env`:

```bash
VITE_ELEVENLABS_API_KEY=sk_tu_api_key_aqui
```

### 3. Configuración de Voz (Opcional)

Puedes cambiar la voz modificando el `VITE_ELEVENLABS_VOICE_ID`:

- **Rachel (inglés)**: `21m00Tcm4TlvDq8ikWAM` (por defecto)
- **Para voces en español**: Ve a [ElevenLabs Voices](https://elevenlabs.io/voices) y copia el ID

### 4. Test de Configuración

Abre `test-elevenlabs.html` en tu navegador para probar la configuración:

1. **Test API Key**: Verifica que tu API key sea válida
2. **List Voices**: Ve todas las voces disponibles
3. **Test Simple**: Prueba TTS básico
4. **Test ElevenLabs**: Prueba TTS completo

## 🎯 Uso en el Código

El componente `TTSButton` maneja automáticamente:

- ✅ Auto-reproducción en nuevas preguntas
- ✅ Fallback al TTS del navegador si ElevenLabs falla
- ✅ Estados de carga y reproducción
- ✅ Configuración desde variables de entorno

```jsx
<TTSButton
    text="Texto a reproducir"
    autoPlay={true}
    autoPlayDelay={800}
    onPlayStart={(text) => console.log('Reproduciendo:', text)}
    onPlayEnd={() => console.log('Audio terminado')}
    onError={(error) => console.error('Error:', error)}
/>
```

## 🔧 Troubleshooting

### Error 400 (Bad Request)
- Verifica que la API key sea correcta
- Asegúrate de que el voice ID existe
- Revisa que el texto no esté vacío

### Error 401 (Unauthorized)
- Tu API key es inválida o ha expirado
- Verifica que hayas copiado la API key completa

### Error 429 (Rate Limit)
- Has excedido el límite de requests
- Espera un momento o upgrade tu plan de ElevenLabs

### CORS Errors
- Estos no deberían ocurrir con ElevenLabs
- Si sucede, verifica la configuración del servidor

## 📝 Notas

- Las API keys empiezan con `sk_`
- El modelo `eleven_multilingual_v2` es más estable
- El texto se limita a 500 caracteres para evitar costos excesivos
- El TTS del navegador funciona como fallback automático
