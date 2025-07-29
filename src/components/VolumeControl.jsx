import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { audioManager } from '../utils/audioManager';
import './VolumeControl.css';

/**
 * CONTROL DE VOLUMEN MODERNO PARA EL JUEGO
 * =======================================
 * 
 * Componente que proporciona controles de volumen estilizados para el juego:
 * - Control de volumen maestro
 * - Control de volumen de música
 * - Control de volumen de efectos de sonido
 * - Botón de silenciar/activar
 * - Diseño moderno con estilo gaming
 */
const VolumeControl = ({ isVisible = true, onClose }) => {
    const [audioState, setAudioState] = useState(audioManager.getAudioState());
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Actualizar estado cuando cambie el audio manager
        const updateState = () => {
            setAudioState(audioManager.getAudioState());
        };

        // Intervalo para mantener el estado actualizado
        const interval = setInterval(updateState, 100);
        
        return () => clearInterval(interval);
    }, []);

    const handleMasterVolumeChange = (e) => {
        const volume = parseFloat(e.target.value);
        audioManager.setMasterVolume(volume);
        setAudioState(audioManager.getAudioState());
    };

    const handleMusicVolumeChange = (e) => {
        const volume = parseFloat(e.target.value);
        audioManager.setMusicVolume(volume);
        setAudioState(audioManager.getAudioState());
    };

    const handleSfxVolumeChange = (e) => {
        const volume = parseFloat(e.target.value);
        audioManager.setSfxVolume(volume);
        setAudioState(audioManager.getAudioState());
    };

    const handleToggleMute = () => {
        audioManager.toggleMute();
        setAudioState(audioManager.getAudioState());
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    if (!isVisible) return null;

    return (
        <div className={`volume-control ${isExpanded ? 'expanded' : ''}`}>
            {/* Botón principal de volumen */}
            <button 
                className="volume-toggle-btn"
                onClick={toggleExpanded}
                title="Controles de audio"
            >
                <div className="volume-icon">
                    {audioState.isMuted ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.63 3.63a.996.996 0 0 0-1.41 1.41L7.29 10.1 7 10.27v7.73c0 .55.45 1 1 1s1-.45 1-1v-4.73l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.54-.77 2.2-1.31l1.42 1.42a.996.996 0 1 0 1.41-1.41L3.63 3.63zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29-.17.17L12 7.76V6c0-.55.45-1 1-1 .57 0 1.03.47 1.03 1.03v.26c1.15.1 2.07.94 2.07 2.1 0 .58-.24 1.13-.63 1.51L17 12.44c.86-.57 1.44-1.52 1.44-2.61 0-1.73-1.41-3.14-3.15-3.14-.56 0-1.09.15-1.54.42L10.29 5.71z"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                    )}
                </div>
                <span className="volume-percentage">
                    {Math.round((audioState.isMuted ? 0 : audioState.masterVolume) * 100)}%
                </span>
            </button>

            {/* Panel expandido de controles */}
            <div className="volume-panel">
                <div className="volume-header">
                    <h3>Controles de Audio</h3>
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Botón de silenciar */}
                <div className="mute-control">
                    <button 
                        className={`mute-btn ${audioState.isMuted ? 'muted' : ''}`}
                        onClick={handleToggleMute}
                    >
                        {audioState.isMuted ? '🔇 Silenciado' : '🔊 Audio Activo'}
                    </button>
                </div>

                {/* Control de volumen maestro */}
                <div className="volume-slider-group">
                    <label className="volume-label">
                        <span className="label-icon">🎛️</span>
                        <span className="label-text">Volumen General</span>
                        <span className="label-value">{Math.round(audioState.masterVolume * 100)}%</span>
                    </label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={audioState.masterVolume}
                            onChange={handleMasterVolumeChange}
                            className="volume-slider master"
                        />
                        <div 
                            className="slider-fill master"
                            style={{ width: `${audioState.masterVolume * 100}%` }}
                        />
                    </div>
                </div>

                {/* Control de volumen de música */}
                <div className="volume-slider-group">
                    <label className="volume-label">
                        <span className="label-icon">🎵</span>
                        <span className="label-text">Música</span>
                        <span className="label-value">{Math.round(audioState.musicVolume * 100)}%</span>
                    </label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={audioState.musicVolume}
                            onChange={handleMusicVolumeChange}
                            className="volume-slider music"
                        />
                        <div 
                            className="slider-fill music"
                            style={{ width: `${audioState.musicVolume * 100}%` }}
                        />
                    </div>
                </div>

                {/* Control de volumen de efectos */}
                <div className="volume-slider-group">
                    <label className="volume-label">
                        <span className="label-icon">🔊</span>
                        <span className="label-text">Efectos</span>
                        <span className="label-value">{Math.round(audioState.sfxVolume * 100)}%</span>
                    </label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={audioState.sfxVolume}
                            onChange={handleSfxVolumeChange}
                            className="volume-slider sfx"
                        />
                        <div 
                            className="slider-fill sfx"
                            style={{ width: `${audioState.sfxVolume * 100}%` }}
                        />
                    </div>
                </div>

                {/* Indicador de estado */}
                <div className="audio-status">
                    <div className="status-item">
                        <span className="status-dot music" />
                        <span>Música: {audioState.isMusicPlaying ? 'Reproduciendo' : 'Pausada'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

VolumeControl.propTypes = {
    isVisible: PropTypes.bool,
    onClose: PropTypes.func
};

export default VolumeControl;
