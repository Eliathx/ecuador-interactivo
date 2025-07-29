# Migration Examples

This file shows how to migrate from the old TTSButton implementation to the new refactored version.

## Example 1: Basic Migration

### Old Code (Before Refactoring)
```jsx
import { TTSButton } from './components/TTSButton.jsx';

function MyComponent() {
  return (
    <TTSButton 
      text="Hello world"
      onPlayStart={(text) => console.log('Playing:', text)}
      onPlayEnd={() => console.log('Finished')}
    />
  );
}
```

### New Code (After Refactoring)
```jsx
// Option 1: Use the new component directly
import { TTSButton } from './components/TTSButton';

function MyComponent() {
  const elevenLabsConfig = {
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
    voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
  };

  return (
    <TTSButton 
      text="Hello world"
      autoPlay={true} // Explicit auto-play (was default before)
      elevenLabsConfig={elevenLabsConfig}
      onPlayStart={(text) => console.log('Playing:', text)}
      onPlayEnd={() => console.log('Finished')}
    />
  );
}

// Option 2: Use configuration helper
import { TTSButton, createTTSConfig } from './components/TTSButton';

function MyComponent() {
  const config = createTTSConfig({
    autoPlay: true
  });

  return (
    <TTSButton 
      text="Hello world"
      {...config}
      onPlayStart={(text) => console.log('Playing:', text)}
      onPlayEnd={() => console.log('Finished')}
    />
  );
}

// Option 3: Keep using the legacy wrapper (no changes needed)
import { TTSButton } from './components/TTSButton.jsx';

function MyComponent() {
  return (
    <TTSButton 
      text="Hello world"
      onPlayStart={(text) => console.log('Playing:', text)}
      onPlayEnd={() => console.log('Finished')}
    />
  );
}
```

## Example 2: Using the Hook for Custom Implementation

### New Feature: Custom TTS Button
```jsx
import { useTTSButton } from './components/TTSButton';

function CustomTTSButton({ text, children }) {
  const {
    isPlaying,
    isLoading,
    handlePlay,
    handleStop
  } = useTTSButton({
    text,
    autoPlay: false,
    elevenLabsConfig: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY
    }
  });

  return (
    <div className="custom-tts-container">
      <p>Audio Status: {isLoading ? 'Loading...' : isPlaying ? 'Playing' : 'Ready'}</p>
      <button 
        onClick={isPlaying ? handleStop : handlePlay}
        disabled={isLoading}
        className="my-custom-button"
      >
        {children || (isPlaying ? 'Stop' : 'Play')}
      </button>
    </div>
  );
}

// Usage
function App() {
  return (
    <CustomTTSButton text="Custom TTS implementation">
      🎵 Custom Play Button
    </CustomTTSButton>
  );
}
```

## Example 3: Using Presets for Different Languages

### Spanish Interface
```jsx
import { TTSButton, presets } from './components/TTSButton';

function SpanishApp() {
  return (
    <TTSButton 
      text="Hola mundo, este es un ejemplo"
      {...presets.spanish}
      {...presets.autoPlay}
    />
  );
}
```

### English Interface
```jsx
import { TTSButton, presets } from './components/TTSButton';

function EnglishApp() {
  return (
    <TTSButton 
      text="Hello world, this is an example"
      {...presets.english}
      {...presets.autoPlay}
    />
  );
}
```

## Example 4: Advanced Configuration

### Custom Voice Settings
```jsx
import { TTSButton } from './components/TTSButton';

function AdvancedTTS() {
  const advancedConfig = {
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
    voiceId: 'custom-voice-id',
    modelId: 'eleven_multilingual_v2',
    voiceSettings: {
      stability: 0.8,      // More stable voice
      similarity_boost: 0.6 // Less similarity boost
    },
    maxTextLength: 1000    // Longer text support
  };

  return (
    <TTSButton 
      text="This is a long text that will be spoken with custom voice settings..."
      autoPlay={true}
      elevenLabsConfig={advancedConfig}
      labels={{
        listen: "🎵 Play Audio",
        stop: "⏹️ Stop Audio",
        loading: "⏳ Generating..."
      }}
      titles={{
        play: "Click to play the text",
        stop: "Click to stop playback"
      }}
    />
  );
}
```

## Example 5: Controlled Component with External Stop

### Parent Component Controls Audio
```jsx
import { useRef } from 'react';
import { TTSButton } from './components/TTSButton';

function AudioController() {
  const ttsRef1 = useRef();
  const ttsRef2 = useRef();

  const stopAllAudio = () => {
    ttsRef1.current?.stop();
    ttsRef2.current?.stop();
  };

  return (
    <div>
      <h2>Multiple TTS Buttons</h2>
      
      <TTSButton 
        ref={ttsRef1}
        text="First audio message"
        autoPlay={false}
      />
      
      <TTSButton 
        ref={ttsRef2}
        text="Second audio message" 
        autoPlay={false}
      />
      
      <button onClick={stopAllAudio} className="stop-all-btn">
        🛑 Stop All Audio
      </button>
    </div>
  );
}
```

## Example 6: Error Handling and Fallback

### Custom Error Handling
```jsx
import { TTSButton } from './components/TTSButton';

function TTSWithErrorHandling() {
  const handleError = (error) => {
    console.error('TTS Error:', error);
    
    if (error.message.includes('API key')) {
      alert('Please configure your ElevenLabs API key');
    } else if (error.message.includes('network')) {
      alert('Network error - check your connection');
    } else {
      alert('TTS error - using browser fallback');
    }
  };

  return (
    <TTSButton 
      text="This text might fail if API is not configured"
      elevenLabsConfig={{
        apiKey: null // This will force fallback to browser TTS
      }}
      onError={handleError}
      onPlayStart={(text) => console.log('Started:', text)}
      onPlayEnd={() => console.log('Finished successfully')}
    />
  );
}
```

## Example 7: Environment-based Configuration

### Different Configs for Development/Production
```jsx
import { TTSButton, getElevenLabsConfigFromEnv } from './components/TTSButton';

function EnvironmentAwareTTS({ text }) {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  const config = {
    ...getElevenLabsConfigFromEnv(),
    // Use faster, less quality settings in development
    ...(isDevelopment && {
      voiceSettings: {
        stability: 0.3,
        similarity_boost: 0.8
      }
    })
  };

  return (
    <TTSButton 
      text={text}
      autoPlay={!isDevelopment} // No auto-play in development
      elevenLabsConfig={config}
      labels={isDevelopment ? {
        listen: "🚧 Dev Play",
        stop: "🚧 Dev Stop",
        loading: "🚧 Dev Loading..."
      } : undefined}
    />
  );
}
```

## Migration Checklist

- [ ] Update imports to use the new TTSButton package
- [ ] Add explicit `autoPlay={true}` if you want the old auto-play behavior
- [ ] Configure ElevenLabs settings using `elevenLabsConfig` prop
- [ ] Test that audio still works as expected
- [ ] Consider using presets for common configurations
- [ ] Update any custom styling to work with the new CSS classes
- [ ] Test error handling and fallback scenarios
