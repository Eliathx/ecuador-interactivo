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
