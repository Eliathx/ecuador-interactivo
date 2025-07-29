import React, { forwardRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTTSButton } from './hooks/useTTSButton';
import './TTSButton.css';

/**
 * TTSButton Component
 * 
 * A reusable Text-to-Speech button component that supports:
 * - ElevenLabs API with browser fallback
 * - Auto-play functionality
 * - Manual play/stop controls
 * - Loading and playing states
 * - Customizable styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - Text to be spoken
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.autoPlay=false] - Whether to auto-play when text changes
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {Function} [props.onPlayStart] - Callback when audio starts playing
 * @param {Function} [props.onPlayEnd] - Callback when audio ends
 * @param {Function} [props.onError] - Callback when an error occurs
 * @param {Object} [props.elevenLabsConfig={}] - ElevenLabs configuration
 * @param {string} [props.elevenLabsConfig.apiKey] - ElevenLabs API key
 * @param {string} [props.elevenLabsConfig.voiceId] - Voice ID to use
 * @param {string} [props.elevenLabsConfig.modelId] - Model ID to use
 * @param {Object} [props.elevenLabsConfig.voiceSettings] - Voice settings
 * @param {number} [props.elevenLabsConfig.maxTextLength] - Maximum text length
 * @param {Object} [props.labels] - Custom button labels
 * @param {string} [props.labels.listen="Escuchar"] - Listen button label
 * @param {string} [props.labels.stop="Detener"] - Stop button label
 * @param {string} [props.labels.loading="Cargando..."] - Loading label
 * @param {Object} [props.titles] - Custom button titles (tooltips)
 * @param {string} [props.titles.play="Reproducir texto"] - Play button tooltip
 * @param {string} [props.titles.stop="Detener audio"] - Stop button tooltip
 */
export const TTSButton = forwardRef(({ 
    text, 
    disabled = false,
    autoPlay = false,
    className = "",
    onPlayStart,
    onPlayEnd,
    onError,
    elevenLabsConfig = {},
    labels = {},
    titles = {}
}, ref) => {
    // Default labels and titles
    const defaultLabels = {
        listen: "Escuchar",
        stop: "Detener",
        loading: "Cargando...",
        ...labels
    };

    const defaultTitles = {
        play: "Reproducir texto",
        stop: "Detener audio",
        ...titles
    };

    // Use the TTS hook
    const {
        isPlaying,
        isLoading,
        showStopButton,
        handlePlay,
        handleStop,
        stop
    } = useTTSButton({
        text,
        disabled,
        autoPlay,
        onPlayStart,
        onPlayEnd,
        onError,
        elevenLabsConfig
    });

    // Handle button click
    const handleClick = () => {
        if (isPlaying || showStopButton) {
            handleStop();
        } else {
            handlePlay();
        }
    };

    // Expose stop method via ref
    React.useImperativeHandle(ref, () => ({
        stop
    }), [stop]);

    return (
        <button
            ref={ref}
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={`tts-button ${className} ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
            title={(isPlaying || showStopButton) ? defaultTitles.stop : defaultTitles.play}
        >
            {isLoading ? (
                <>
                    <Loader2 className="tts-loading-icon" size={20} />
                    <span className="tts-text">{defaultLabels.loading}</span>
                </>
            ) : (isPlaying || showStopButton) ? (
                <>
                    <VolumeX size={20} />
                    <span className="tts-text">{defaultLabels.stop}</span>
                </>
            ) : (
                <>
                    <Volume2 size={20} />
                    <span className="tts-text">{defaultLabels.listen}</span>
                </>
            )}
        </button>
    );
});

TTSButton.displayName = 'TTSButton';
