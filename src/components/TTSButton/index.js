/**
 * TTSButton Component Package
 * 
 * A comprehensive Text-to-Speech button component for React applications.
 * Supports ElevenLabs API with browser fallback, auto-play functionality,
 * and customizable styling.
 */

export { TTSButton } from './TTSButton';
export { useTTSButton } from './hooks/useTTSButton';
export { 
  getElevenLabsConfigFromEnv,
  createTTSConfig,
  spanishLabels,
  englishLabels,
  spanishTitles,
  englishTitles,
  presets
} from './config';
