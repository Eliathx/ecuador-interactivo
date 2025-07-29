import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { audioManager } from '../../../utils/audioManager';

/**
 * Custom hook for TTS (Text-to-Speech) functionality
 * Supports both ElevenLabs API and browser's built-in speech synthesis as fallback
 * Integrates with audioManager to manage background music volume during TTS playback
 */
export const useTTSButton = ({ 
  text, 
  disabled = false,
  autoPlay = false,
  onPlayStart,
  onPlayEnd,
  onError,
  elevenLabsConfig = {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  
  // Internal refs for managing state and preventing race conditions
  const currentAudioRef = useRef(null);
  const currentAudioUrlRef = useRef(null);
  const lastTextRef = useRef('');
  const isManuallyStoppedRef = useRef(false);
  const autoPlayTimerRef = useRef(null);
  const isPlayingRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Sync refs with state to avoid stale closures
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Global audio manager singleton to prevent audio overlap
  const globalAudioManagerRef = useRef({
    currentAudio: null,
    currentAudioUrl: null,
    isPlaying: false,
    stopAllAudio: () => {
      // Restaurar el volumen de la música de fondo al detener todo el audio
      audioManager.restoreBackgroundMusic();
      
      if (globalAudioManagerRef.current.currentAudio) {
        if (typeof globalAudioManagerRef.current.currentAudio.stopManually === 'function') {
          globalAudioManagerRef.current.currentAudio.stopManually();
        } else {
          globalAudioManagerRef.current.currentAudio.pause();
          globalAudioManagerRef.current.currentAudio.currentTime = 0;
        }
        globalAudioManagerRef.current.currentAudio = null;
      }
      
      if (globalAudioManagerRef.current.currentAudioUrl) {
        try {
          URL.revokeObjectURL(globalAudioManagerRef.current.currentAudioUrl);
        } catch {
          // Silently ignore errors
        }
        globalAudioManagerRef.current.currentAudioUrl = null;
      }
      
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      globalAudioManagerRef.current.isPlaying = false;
    }
  });
  
  const globalAudioManager = globalAudioManagerRef.current;

  // Memoized ElevenLabs configuration
  const defaultElevenLabsConfig = useMemo(() => ({
    apiKey: null,
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    modelId: 'eleven_multilingual_v2',
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.75
    },
    maxTextLength: 500,
    ...elevenLabsConfig
  }), [elevenLabsConfig]);

  // Clean up audio resources
  const cleanupAudio = useCallback((audio, audioUrl) => {
    // Restaurar el volumen de la música de fondo al limpiar el audio
    audioManager.restoreBackgroundMusic();
    
    if (audio) {
      if (typeof audio.stopManually === 'function') {
        audio.stopManually();
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    }
    
    if (audioUrl) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch {
        // Silently ignore errors
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Stop current audio playback
  const stopCurrentAudio = useCallback((resetButton = true, isManualStop = false) => {
    if (isManualStop) {
      isManuallyStoppedRef.current = true;
    }
    
    // Restaurar el volumen de la música de fondo al detener el TTS
    audioManager.restoreBackgroundMusic();
    
    // Stop current audio
    cleanupAudio(currentAudioRef.current, currentAudioUrlRef.current);
    
    // Stop global audio
    globalAudioManager.stopAllAudio();
    
    // Clear auto-play timer
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    
    // Update state
    setIsPlaying(false);
    setIsLoading(false);
    
    if (resetButton) {
      setShowStopButton(false);
    }
    
    // Clear refs
    currentAudioRef.current = null;
    currentAudioUrlRef.current = null;
  }, [cleanupAudio, globalAudioManager]);

  // Browser TTS fallback
  const fallbackToBrowserTTS = useCallback((textToSpeak) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      setIsPlaying(false);
      setIsLoading(false);
      setShowStopButton(false);
      onError?.(new Error('Speech synthesis not supported'));
      return;
    }

    try {
      setIsLoading(false);
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        // Reducir el volumen de la música de fondo cuando inicia el TTS
        audioManager.duckBackgroundMusic();
        setIsPlaying(true);
        onPlayStart?.(textToSpeak);
      };

      utterance.onend = () => {
        // Restaurar el volumen de la música de fondo cuando termina el TTS
        audioManager.restoreBackgroundMusic();
        setIsPlaying(false);
        setShowStopButton(false);
        onPlayEnd?.();
      };

      utterance.onerror = (event) => {
        // Restaurar el volumen de la música de fondo en caso de error
        audioManager.restoreBackgroundMusic();
        setIsPlaying(false);
        setIsLoading(false);
        setShowStopButton(false);
        onError?.(event);
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      setIsPlaying(false);
      setIsLoading(false);
      setShowStopButton(false);
      onError?.(error);
    }
  }, [onPlayStart, onPlayEnd, onError]);

  // ElevenLabs TTS implementation
  const playWithElevenLabs = useCallback(async (textToSpeak) => {
    const { apiKey, voiceId, modelId, voiceSettings, maxTextLength } = defaultElevenLabsConfig;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: textToSpeak.substring(0, maxTextLength),
        model_id: modelId,
        voice_settings: voiceSettings
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = errorText;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail?.message) {
          errorDetails = errorJson.detail.message;
        }
      } catch {
        // Keep original error text
      }
      
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorDetails}`);
    }

    const audioBlob = await response.blob();
    
    // Clean up previous audio URL
    if (currentAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      } catch {
        // Silently ignore
      }
    }
    
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Store references
    currentAudioRef.current = audio;
    currentAudioUrlRef.current = audioUrl;
    
    // Register with global manager
    globalAudioManager.currentAudio = audio;
    globalAudioManager.currentAudioUrl = audioUrl;
    globalAudioManager.isPlaying = true;
    
    let audioPlayedSuccessfully = false;
    let manuallyStopped = false;
    
    // Add custom stop method
    audio.stopManually = () => {
      manuallyStopped = true;
      audio.pause();
      audio.currentTime = 0;
    };

    // Set up event handlers
    audio.onended = () => {
      audioPlayedSuccessfully = true;
      // Restaurar el volumen de la música de fondo cuando termina el TTS
      audioManager.restoreBackgroundMusic();
      setIsPlaying(false);
      setShowStopButton(false);
      currentAudioRef.current = null;
      
      globalAudioManager.currentAudio = null;
      globalAudioManager.currentAudioUrl = null;
      globalAudioManager.isPlaying = false;
      
      onPlayEnd?.();
    };

    audio.onerror = () => {
      if (isManuallyStoppedRef.current) return;
      
      if (!audioPlayedSuccessfully && !manuallyStopped) {
        // Restaurar el volumen de la música de fondo en caso de error
        audioManager.restoreBackgroundMusic();
        setIsPlaying(false);
        setShowStopButton(false);
        currentAudioRef.current = null;
        
        globalAudioManager.currentAudio = null;
        globalAudioManager.currentAudioUrl = null;
        globalAudioManager.isPlaying = false;
        
        // Fallback to browser TTS
        fallbackToBrowserTTS(textToSpeak);
      }
    };

    setIsLoading(false);
    setIsPlaying(true);
    
    // Reducir el volumen de la música de fondo antes de reproducir el TTS
    audioManager.duckBackgroundMusic();
    
    await audio.play();
  }, [defaultElevenLabsConfig, globalAudioManager, fallbackToBrowserTTS, onPlayEnd]);

  // Main play function
  const playTextToSpeech = useCallback(async (textToSpeak) => {
    if (!textToSpeak?.trim()) return;

    try {
      // Reset manual stop flag
      isManuallyStoppedRef.current = false;
      
      // Stop any current audio
      globalAudioManager.stopAllAudio();
      stopCurrentAudio(false);
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      setIsLoading(true);
      setShowStopButton(true);
      onPlayStart?.(textToSpeak);

      // Try ElevenLabs first, fallback to browser TTS on failure
      try {
        await playWithElevenLabs(textToSpeak);
      } catch (error) {
        if (isManuallyStoppedRef.current) return;
        console.warn('ElevenLabs TTS failed, using browser fallback:', error);
        fallbackToBrowserTTS(textToSpeak);
      }
    } catch (error) {
      if (isManuallyStoppedRef.current) return;
      console.error('TTS playback failed:', error);
      fallbackToBrowserTTS(textToSpeak);
    }
  }, [onPlayStart, stopCurrentAudio, globalAudioManager, playWithElevenLabs, fallbackToBrowserTTS]);

  // Auto-play effect when text changes
  useEffect(() => {
    if (!autoPlay || !text?.trim() || disabled || text === lastTextRef.current) {
      return;
    }

    const textToPlay = text;
    
    // Stop current audio immediately
    globalAudioManager.stopAllAudio();
    stopCurrentAudio(true, true);
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Clear previous timer
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    
    // Schedule auto-play
    autoPlayTimerRef.current = setTimeout(() => {
      lastTextRef.current = textToPlay;
      playTextToSpeech(textToPlay);
    }, 300);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      cleanupAudio(currentAudioRef.current, currentAudioUrlRef.current);
      globalAudioManager.stopAllAudio();
      
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [cleanupAudio, globalAudioManager]);

  // Public API
  const handlePlay = useCallback(() => {
    if (text?.trim() && !disabled) {
      playTextToSpeech(text);
    }
  }, [text, disabled, playTextToSpeech]);

  const handleStop = useCallback(() => {
    stopCurrentAudio(true, true);
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
    setIsLoading(false);
    setShowStopButton(false);
    onPlayEnd?.();
  }, [stopCurrentAudio, onPlayEnd]);

  const stop = useCallback(() => {
    globalAudioManager.stopAllAudio();
    stopCurrentAudio(true, true);
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
    setIsLoading(false);
    setShowStopButton(false);
  }, [globalAudioManager, stopCurrentAudio]);

  // Cleanup effect - restaurar música al desmontar componente
  useEffect(() => {
    return () => {
      // Asegurar que la música se restaure cuando el componente se desmonte
      audioManager.restoreBackgroundMusic();
      globalAudioManager.stopAllAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [globalAudioManager]);

  return {
    isPlaying,
    isLoading,
    showStopButton,
    handlePlay,
    handleStop,
    stop
  };
};
