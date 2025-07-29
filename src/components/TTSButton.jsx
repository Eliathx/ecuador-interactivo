/**
 * TTSButton - Legacy wrapper for backward compatibility
 * 
 * This file maintains backward compatibility with the old implementation
 * while using the new refactored component under the hood.
 * 
 * For new projects, use: import { TTSButton } from './TTSButton/index';
 */

import React, { forwardRef } from 'react';
import { TTSButton as NewTTSButton, getElevenLabsConfigFromEnv } from './TTSButton/index';

// Variable global para manejar el estado de audio globalmente y evitar solapamiento
let globalAudioManager = {
    currentAudio: null,
    currentAudioUrl: null,
    isPlaying: false,
    stopAllAudio: () => {
        if (globalAudioManager.currentAudio) {
            if (typeof globalAudioManager.currentAudio.stopManually === 'function') {
                globalAudioManager.currentAudio.stopManually();
            } else {
                globalAudioManager.currentAudio.pause();
                globalAudioManager.currentAudio.currentTime = 0;
            }
            globalAudioManager.currentAudio = null;
        }
        
        if (globalAudioManager.currentAudioUrl) {
            try {
                URL.revokeObjectURL(globalAudioManager.currentAudioUrl);
            } catch {
                // Silently ignore
            }
            globalAudioManager.currentAudioUrl = null;
        }
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        globalAudioManager.isPlaying = false;
        console.log('🌐 Global audio manager: Todo el audio detenido');
    }
};

export const TTSButton = forwardRef(({ 
    text, 
    disabled = false,
    className = "",
    onPlayStart,
    onPlayEnd,
    onError
}, ref) => {
    // Get configuration from environment variables
    const elevenLabsConfig = getElevenLabsConfigFromEnv();

    return (
        <NewTTSButton
            ref={ref}
            text={text}
            disabled={disabled}
            autoPlay={true} // Maintain old behavior of auto-play
            className={className}
            onPlayStart={onPlayStart}
            onPlayEnd={onPlayEnd}
            onError={onError}
            elevenLabsConfig={elevenLabsConfig}
        />
    );
});
