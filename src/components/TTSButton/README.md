# TTSButton Component

A reusable Text-to-Speech button component for React applications with ElevenLabs API support and browser fallback.

## Features

- 🎵 **ElevenLabs API Integration**: High-quality AI voice synthesis
- 🔄 **Browser Fallback**: Automatic fallback to browser's built-in TTS
- ⚡ **Auto-play**: Automatically play when text changes
- 🎨 **Customizable**: Flexible styling and configuration options
- 🌐 **Multilingual**: Support for multiple languages
- 🔧 **TypeScript Ready**: Full TypeScript support (if needed)
- 📱 **Responsive**: Works on desktop and mobile devices

## Installation

Simply copy the `TTSButton` folder to your React project's components directory.

```bash
cp -r TTSButton src/components/
```

## Basic Usage

```jsx
import React from 'react';
import { TTSButton } from './components/TTSButton';

function App() {
  return (
    <div>
      <TTSButton 
        text="Hello, this is a test message"
        onPlayStart={(text) => console.log('Started playing:', text)}
        onPlayEnd={() => console.log('Finished playing')}
        onError={(error) => console.error('TTS Error:', error)}
      />
    </div>
  );
}
```

## Configuration

### Environment Variables

For ElevenLabs API integration, set these environment variables:

```env
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
VITE_ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

### Using Configuration Helper

```jsx
import { TTSButton, createTTSConfig, presets } from './components/TTSButton';

const ttsConfig = createTTSConfig({
  ...presets.spanish,
  ...presets.autoPlay,
  elevenLabsConfig: {
    apiKey: 'your-api-key',
    voiceId: 'your-voice-id'
  }
});

function App() {
  return (
    <TTSButton 
      text="Hola, este es un mensaje de prueba"
      {...ttsConfig}
    />
  );
}
```

## Advanced Usage

### Auto-play with Custom Configuration

```jsx
import { TTSButton } from './components/TTSButton';

function AutoPlayExample() {
  const [currentText, setCurrentText] = useState("Initial text");

  return (
    <div>
      <TTSButton 
        text={currentText}
        autoPlay={true}
        elevenLabsConfig={{
          apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          voiceSettings: {
            stability: 0.7,
            similarity_boost: 0.8
          }
        }}
        labels={{
          listen: "🔊 Listen",
          stop: "⏹️ Stop",
          loading: "⏳ Loading..."
        }}
      />
      <button onClick={() => setCurrentText("New text to speak")}>
        Change Text
      </button>
    </div>
  );
}
```

### Using the Hook Directly

```jsx
import { useTTSButton } from './components/TTSButton';

function CustomTTSComponent({ text }) {
  const {
    isPlaying,
    isLoading,
    showStopButton,
    handlePlay,
    handleStop
  } = useTTSButton({
    text,
    autoPlay: true,
    onPlayStart: (text) => console.log('Playing:', text),
    onPlayEnd: () => console.log('Finished'),
    elevenLabsConfig: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY
    }
  });

  return (
    <div>
      <p>Status: {isLoading ? 'Loading...' : isPlaying ? 'Playing' : 'Ready'}</p>
      <button onClick={isPlaying ? handleStop : handlePlay}>
        {isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
}
```

### Controlled Component with Ref

```jsx
import { useRef } from 'react';
import { TTSButton } from './components/TTSButton';

function ControlledExample() {
  const ttsRef = useRef();

  const stopAllAudio = () => {
    ttsRef.current?.stop();
  };

  return (
    <div>
      <TTSButton 
        ref={ttsRef}
        text="This audio can be stopped externally"
        autoPlay={true}
      />
      <button onClick={stopAllAudio}>Stop All Audio</button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | Text to be spoken (required) |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `autoPlay` | `boolean` | `false` | Auto-play when text changes |
| `className` | `string` | `""` | Additional CSS classes |
| `onPlayStart` | `function` | - | Callback when audio starts |
| `onPlayEnd` | `function` | - | Callback when audio ends |
| `onError` | `function` | - | Callback when error occurs |
| `elevenLabsConfig` | `object` | `{}` | ElevenLabs configuration |
| `labels` | `object` | Spanish defaults | Button text labels |
| `titles` | `object` | Spanish defaults | Button tooltips |

### ElevenLabs Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `apiKey` | `string` | `null` | ElevenLabs API key |
| `voiceId` | `string` | `'21m00Tcm4TlvDq8ikWAM'` | Voice ID to use |
| `modelId` | `string` | `'eleven_multilingual_v2'` | Model ID to use |
| `voiceSettings` | `object` | See below | Voice settings |
| `maxTextLength` | `number` | `500` | Maximum text length |

#### Default Voice Settings

```javascript
{
  stability: 0.5,
  similarity_boost: 0.75
}
```

## Styling

The component uses CSS classes that you can customize:

```css
.tts-button {
  /* Base button styles */
}

.tts-button.playing {
  /* Styles when audio is playing */
}

.tts-button.loading {
  /* Styles when loading */
}

.tts-loading-icon {
  /* Loading spinner styles */
}

.tts-text {
  /* Button text styles */
}
```

## Presets

Use predefined configurations for common scenarios:

```jsx
import { TTSButton, presets } from './components/TTSButton';

// Spanish interface
<TTSButton text="Hola mundo" {...presets.spanish} />

// English interface
<TTSButton text="Hello world" {...presets.english} />

// Auto-play enabled
<TTSButton text="Auto-play text" {...presets.autoPlay} />

// Fast speech
<TTSButton text="Fast speech" {...presets.fastSpeech} />

// Slow speech
<TTSButton text="Slow speech" {...presets.slowSpeech} />
```

## Browser Compatibility

- **ElevenLabs API**: Works in all modern browsers
- **Browser TTS Fallback**: Supported in Chrome, Firefox, Safari, Edge
- **Auto-play**: May be blocked by browser auto-play policies

## Error Handling

The component automatically falls back to browser TTS when:
- ElevenLabs API key is missing
- API request fails
- Network issues occur
- Audio playback fails

## Performance Considerations

- Audio URLs are automatically cleaned up to prevent memory leaks
- Only one audio instance plays at a time (global audio management)
- Text is truncated to prevent overly long API requests
- Debounced auto-play prevents rapid-fire requests

## Migration from Old Version

If you're migrating from the previous TTSButton implementation:

1. Replace the import:
   ```jsx
   // Old
   import { TTSButton } from './components/TTSButton.jsx';
   
   // New
   import { TTSButton } from './components/TTSButton';
   ```

2. Update environment variables (if using ElevenLabs):
   ```env
   # The environment variable names remain the same
   VITE_ELEVENLABS_API_KEY=your_key
   VITE_ELEVENLABS_VOICE_ID=your_voice_id
   VITE_ELEVENLABS_MODEL_ID=your_model_id
   ```

3. Add auto-play if needed:
   ```jsx
   // Old behavior (auto-play was default)
   <TTSButton text={text} />
   
   // New (explicit auto-play)
   <TTSButton text={text} autoPlay={true} />
   ```

The new version is backward compatible with most existing usage patterns.
