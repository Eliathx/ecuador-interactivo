/**
 * TTSButton Configuration Helper
 * 
 * This module provides utilities for configuring the TTSButton component
 * with environment variables and default settings.
 */

/**
 * Get ElevenLabs configuration from environment variables
 * @returns {Object} ElevenLabs configuration object
 */
export const getElevenLabsConfigFromEnv = () => {
  let apiKey, voiceId, modelId;

  // Try to get configuration from Vite environment variables
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;
      modelId = import.meta.env.VITE_ELEVENLABS_MODEL_ID;
    }
  } catch (error) {
    // Fallback to null values if environment variables are not available
    console.warn('Environment variables not available:', error);
  }

  return {
    apiKey: apiKey || null,
    voiceId: voiceId || '21m00Tcm4TlvDq8ikWAM',
    modelId: modelId || 'eleven_multilingual_v2',
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.75
    },
    maxTextLength: 500
  };
};

/**
 * Create a preconfigured TTSButton component with environment settings
 * @param {Object} additionalConfig - Additional configuration to merge
 * @returns {Object} Configuration object for TTSButton
 */
export const createTTSConfig = (additionalConfig = {}) => {
  const envConfig = getElevenLabsConfigFromEnv();
  
  return {
    elevenLabsConfig: {
      ...envConfig,
      ...additionalConfig.elevenLabsConfig
    },
    ...additionalConfig
  };
};

/**
 * Default Spanish labels for the TTSButton
 */
export const spanishLabels = {
  listen: "Escuchar",
  stop: "Detener",
  loading: "Cargando..."
};

/**
 * Default English labels for the TTSButton
 */
export const englishLabels = {
  listen: "Listen",
  stop: "Stop",
  loading: "Loading..."
};

/**
 * Default Spanish titles (tooltips) for the TTSButton
 */
export const spanishTitles = {
  play: "Reproducir texto",
  stop: "Detener audio"
};

/**
 * Default English titles (tooltips) for the TTSButton
 */
export const englishTitles = {
  play: "Play text",
  stop: "Stop audio"
};

/**
 * Preset configurations for common use cases
 */
export const presets = {
  spanish: {
    labels: spanishLabels,
    titles: spanishTitles
  },
  english: {
    labels: englishLabels,
    titles: englishTitles
  },
  autoPlay: {
    autoPlay: true
  },
  fastSpeech: {
    elevenLabsConfig: {
      voiceSettings: {
        stability: 0.3,
        similarity_boost: 0.8
      }
    }
  },
  slowSpeech: {
    elevenLabsConfig: {
      voiceSettings: {
        stability: 0.8,
        similarity_boost: 0.6
      }
    }
  }
};
