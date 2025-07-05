import React, { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import './TTSButton.css';

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
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showStopButton, setShowStopButton] = useState(false); // Nuevo estado para controlar cuándo mostrar "Detenerse"
    const [currentAudio, setCurrentAudio] = useState(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(null); // Para manejar la limpieza de URLs
    const lastTextRef = useRef(''); // Para detectar cambios de texto
    const isPlayingRef = useRef(false); // Para evitar dependencias problemáticas en useEffect
    const isLoadingRef = useRef(false); // Para evitar dependencias problemáticas en useEffect
    const autoPlayTimerRef = useRef(null); // Para controlar el timer de auto-play
    const isManuallyStoppedRef = useRef(false); // Para evitar fallback cuando se detiene manualmente

    // Sync refs with state
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Limpiando TTSButton al desmontar...');
            
            // Marcar como detenido manualmente para evitar fallback
            isManuallyStoppedRef.current = true;
            
            // Stop current audio
            if (currentAudio) {
                if (typeof currentAudio.stopManually === 'function') {
                    currentAudio.stopManually();
                } else {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
            }
            
            // Stop browser TTS
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            
            // Limpiar del manager global
            globalAudioManager.stopAllAudio();
            
            // Limpiar URL actual si existe
            if (currentAudioUrl) {
                try {
                    URL.revokeObjectURL(currentAudioUrl);
                } catch {
                    // Silently ignore if URL was already revoked
                }
            }
            
            // Limpiar timer de auto-play en unmount
            if (autoPlayTimerRef.current) {
                clearTimeout(autoPlayTimerRef.current);
                autoPlayTimerRef.current = null;
            }
        };
    }, [currentAudio, currentAudioUrl]);

    const stopCurrentAudio = useCallback((resetButton = true, isManualStop = false) => {
        console.log(`🛑 stopCurrentAudio llamado - resetButton: ${resetButton}, isManualStop: ${isManualStop}`);
        
        // Marcar como detenido manualmente si se especifica
        if (isManualStop) {
            isManuallyStoppedRef.current = true;
            console.log('🛑 Audio detenido manualmente - no se ejecutará fallback');
        }
        
        // Stop ElevenLabs audio
        if (currentAudio) {
            console.log('🔇 Deteniendo audio de ElevenLabs...');
            // Usar la función especial para marcar como detenido manualmente
            if (typeof currentAudio.stopManually === 'function') {
                console.log('🔇 Usando stopManually() personalizado...');
                currentAudio.stopManually();
            } else {
                // Fallback para audios que no tienen la función
                console.log('🔇 Usando pause() y currentTime=0...');
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            setCurrentAudio(null);
        }
        
        // Stop browser TTS
        if ('speechSynthesis' in window) {
            console.log('🔇 Cancelando browser TTS...');
            window.speechSynthesis.cancel();
        }
        
        // Limpiar del manager global también
        globalAudioManager.stopAllAudio();
        
        // Limpiar timer de auto-play si existe
        if (autoPlayTimerRef.current) {
            console.log('🧹 Limpiando timer de auto-play...');
            clearTimeout(autoPlayTimerRef.current);
            autoPlayTimerRef.current = null;
        }
        
        setIsPlaying(false);
        setIsLoading(false);
        
        // Solo resetear el botón si se especifica
        if (resetButton) {
            setShowStopButton(false); // Resetear el botón a "Escuchar"
        }
        
        console.log('✅ stopCurrentAudio completado');
    }, [currentAudio]);

    const fallbackToBrowserTTS = useCallback((textToSpeak) => {
        try {
            console.log('🔊 FALLBACK: Usando TTS del navegador (ElevenLabs falló)');
            console.log(`🔊 FALLBACK: Texto a reproducir: "${textToSpeak.substring(0, 50)}..."`);
            setIsLoading(false);
            console.log(`📊 FALLBACK: Estado después de setIsLoading(false): loading=false`);
            
            if ('speechSynthesis' in window) {
                console.log('✅ FALLBACK: speechSynthesis disponible');
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'es-ES';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                utterance.onstart = () => {
                    console.log('✅ TTS del navegador iniciado');
                    setIsPlaying(true);
                    console.log(`📊 FALLBACK: Estado después de setIsPlaying(true): playing=true`);
                };

                utterance.onend = () => {
                    console.log('🎵 TTS del navegador terminó');
                    setIsPlaying(false);
                    setShowStopButton(false); // Resetear a "Escuchar" cuando termine
                    console.log(`📊 FALLBACK: Estado después de setIsPlaying(false): playing=false`);
                    onPlayEnd?.();
                };

                utterance.onerror = (event) => {
                    console.error('❌ Error en TTS del navegador:', event);
                    setIsPlaying(false);
                    setIsLoading(false);
                    setShowStopButton(false); // Resetear a "Escuchar" en caso de error
                    onError?.(event);
                };

                console.log('🔊 FALLBACK: Iniciando setIsPlaying(true)...');
                setIsPlaying(true);
                console.log('🔊 FALLBACK: Llamando window.speechSynthesis.speak()...');
                window.speechSynthesis.speak(utterance);
                console.log('▶️ TTS del navegador iniciado');
            } else {
                console.error('❌ FALLBACK: speechSynthesis NO disponible en este navegador');
                setIsPlaying(false);
                setIsLoading(false);
                setShowStopButton(false); // Resetear en caso de no soporte
                throw new Error('Speech synthesis not supported');
            }
        } catch (error) {
            console.error('❌ Browser TTS fallback failed:', error);
            setIsPlaying(false);
            setIsLoading(false);
            setShowStopButton(false); // Resetear en caso de error
            onError?.(error);
        }
    }, [onPlayEnd, onError]);

    const playTextToSpeech = useCallback(async (textToSpeak) => {
        try {
            console.log(`🎬 playTextToSpeech iniciado con: "${textToSpeak.substring(0, 50)}..."`);
            
            // Resetear bandera de stop manual al iniciar nueva reproducción
            isManuallyStoppedRef.current = false;
            
            // CRÍTICO: Stop any current audio AND browser TTS FIRST para evitar solapamiento
            console.log('🛑 CRÍTICO: Deteniendo cualquier audio actual para evitar solapamiento...');
            
            // Detener audio global primero
            globalAudioManager.stopAllAudio();
            
            // Luego detener audio local
            stopCurrentAudio(false); // No resetear el botón aquí
            
            // Ensure browser TTS is cancelled before starting ElevenLabs
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                console.log('🔇 Browser TTS cancelado para evitar solapamiento');
            }

            // Pequeño delay para asegurar que el audio anterior se detuvo completamente
            await new Promise(resolve => setTimeout(resolve, 100));

            // THEN set the loading and button states
            setIsLoading(true);
            setShowStopButton(true); // Mostrar "Detenerse" inmediatamente al hacer clic
            console.log(`📊 Estado después de setIsLoading(true): loading=true`);
            onPlayStart?.(textToSpeak);

            console.log('🎵 Intentando TTS con ElevenLabs para:', textToSpeak.substring(0, 50) + '...');

            // Get configuration from environment variables
            const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
            const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
            const modelId = import.meta.env.VITE_ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

            console.log(`🔑 API Key existe: ${!!apiKey}, Voice ID: ${voiceId}`);

            if (!apiKey) {
                console.warn(`❌ API key no encontrada, usando fallback inmediatamente`);
                throw new Error('ElevenLabs API key no configurada');
            }

            // Try ElevenLabs API first
            console.log(`🌐 Haciendo request a ElevenLabs...`);
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text: textToSpeak.substring(0, 500), // Limitar texto para evitar problemas
                    model_id: modelId,
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            console.log('🌐 Respuesta de ElevenLabs:', response.status, response.statusText);

            if (response.ok) {
                console.log('✅ ElevenLabs respondió correctamente, creando audio...');
                const audioBlob = await response.blob();
                console.log('📦 Audio blob creado, tamaño:', audioBlob.size, 'bytes');
                
                // Limpiar URL anterior si existe
                if (currentAudioUrl) {
                    try {
                        URL.revokeObjectURL(currentAudioUrl);
                    } catch {
                        // Silently ignore
                    }
                }
                
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                // Registrar audio en el manager global
                globalAudioManager.currentAudio = audio;
                globalAudioManager.currentAudioUrl = audioUrl;
                globalAudioManager.isPlaying = true;
                
                // Flag to track if audio played successfully
                let audioPlayedSuccessfully = false;
                let manuallyStopped = false; // Flag para detectar parada manual
                
                setCurrentAudio(audio);
                setCurrentAudioUrl(audioUrl);
                setIsLoading(false);
                setIsPlaying(true);

                audio.onended = () => {
                    console.log('🎵 Audio de ElevenLabs terminó');
                    audioPlayedSuccessfully = true;
                    setIsPlaying(false);
                    setShowStopButton(false); // Resetear a "Escuchar" cuando termine
                    setCurrentAudio(null);
                    
                    // Limpiar del manager global
                    globalAudioManager.currentAudio = null;
                    globalAudioManager.currentAudioUrl = null;
                    globalAudioManager.isPlaying = false;
                    
                    // No limpiar la URL aquí, se limpiará cuando se desmonte el componente o se cree un nuevo audio
                    onPlayEnd?.();
                };

                audio.onerror = (e) => {
                    // Verificar si fue detenido manualmente o si el componente se desmontó
                    if (isManuallyStoppedRef.current) {
                        console.log('🔇 Audio detenido manualmente - no usar fallback');
                        return;
                    }
                    
                    // Solo manejar como error real si el audio nunca se reprodujo exitosamente Y no fue detenido manualmente
                    if (!audioPlayedSuccessfully && !manuallyStopped) {
                        console.error('❌ Error real reproduciendo audio de ElevenLabs:', e);
                        setIsPlaying(false);
                        setShowStopButton(false); // Resetear a "Escuchar" en caso de error
                        setCurrentAudio(null);
                        
                        // Limpiar del manager global
                        globalAudioManager.currentAudio = null;
                        globalAudioManager.currentAudioUrl = null;
                        globalAudioManager.isPlaying = false;
                        
                        console.log('🔄 Audio nunca se reprodujo exitosamente, usando fallback...');
                        fallbackToBrowserTTS(textToSpeak);
                    } else {
                        console.log('🔇 Audio detenido manualmente o terminó correctamente - no usar fallback');
                    }
                };

                // Función para marcar como detenido manualmente
                audio.stopManually = () => {
                    manuallyStopped = true;
                    audio.pause();
                    audio.currentTime = 0;
                };

                console.log('▶️ Iniciando reproducción de audio ElevenLabs...');
                
                try {
                    await audio.play();
                    console.log('✅ Audio de ElevenLabs reproduciéndose correctamente - NO usar fallback');
                } catch (playError) {
                    console.error('❌ Error al iniciar reproducción:', playError);
                    setIsPlaying(false);
                    setShowStopButton(false); // Resetear a "Escuchar" en caso de error
                    setCurrentAudio(null);
                    fallbackToBrowserTTS(textToSpeak);
                    return;
                }
                
                // SUCCESS: Return here to avoid fallback
                return;
            } else {
                const errorText = await response.text();
                console.error('❌ Error de ElevenLabs API:', response.status, errorText);
                
                // Parse error details for better user feedback
                let errorDetails = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.detail && errorJson.detail.message) {
                        errorDetails = errorJson.detail.message;
                    }
                } catch {
                    // Keep original error text if parsing fails
                }
                
                // Special handling for common API errors
                if (response.status === 401) {
                    console.warn('🔑 ElevenLabs API key issue - consider using browser TTS only');
                    // Could set a flag here to disable ElevenLabs for this session
                }
                
                throw new Error(`ElevenLabs API error: ${response.status} - ${errorDetails}`);
            }
        } catch (error) {
            // Verificar si fue detenido manualmente antes de hacer fallback
            if (isManuallyStoppedRef.current) {
                console.log('🔇 Reproducción cancelada manualmente - no usar fallback');
                return;
            }
            
            console.warn('🔄 ElevenLabs TTS falló, usando fallback del navegador:', error);
            fallbackToBrowserTTS(textToSpeak);
        }
    }, [onPlayStart, onPlayEnd, stopCurrentAudio, fallbackToBrowserTTS, currentAudioUrl]);

    // Auto-play cuando el texto cambia - versión simplificada y robusta
    useEffect(() => {
        // Solo ejecutar si hay texto válido y es diferente al anterior
        if (!text || !text.trim() || disabled) {
            console.log(`⏸️ Auto-play omitido - text="${!!text}", disabled=${disabled}`);
            return;
        }

        // Si el texto es igual al anterior, no hacer nada
        if (text === lastTextRef.current) {
            console.log(`⏸️ Auto-play omitido - texto igual al anterior`);
            return;
        }

        console.log(`🎵 NUEVO TEXTO DETECTADO, programando auto-play: "${text.substring(0, 50)}..."`);
        console.log(`🔍 DEBUG - Texto anterior: "${lastTextRef.current}"`);
        console.log(`🔍 DEBUG - Texto nuevo: "${text}"`);
        
        const textToPlay = text; // Capturar el texto antes de programar
        
        // IMPORTANTE: Detener cualquier audio actual INMEDIATAMENTE para evitar solapamiento
        console.log('🛑 Deteniendo audio actual para evitar solapamiento...');
        
        // Detener audio global primero
        globalAudioManager.stopAllAudio();
        
        // Luego detener audio local
        stopCurrentAudio(true, true); // resetButton=true, isManualStop=true
        
        // Detener también el TTS del navegador
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        // NO actualizar lastTextRef.current aquí - solo cuando se ejecute realmente
        
        // Limpiar cualquier timer anterior
        if (autoPlayTimerRef.current) {
            console.log(`🧹 Limpiando timer anterior`);
            clearTimeout(autoPlayTimerRef.current);
        }
        
        // Programar auto-play con delay más corto
        autoPlayTimerRef.current = setTimeout(() => {
            console.log(`🚀 EJECUTANDO AUTO-PLAY para: "${textToPlay.substring(0, 50)}..."`);
            // Actualizar lastTextRef AQUÍ, cuando realmente se ejecuta
            lastTextRef.current = textToPlay;
            playTextToSpeech(textToPlay);
        }, 300);
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]); // Solo depender del texto, ignorar disabled para simplificar

    const handlePlay = useCallback(() => {
        if (text && !disabled) {
            playTextToSpeech(text);
        }
    }, [text, disabled, playTextToSpeech]);

    const handleStop = useCallback(() => {
        console.log('🛑 Usuario detuvo manualmente el audio');
        
        // Stop ElevenLabs audio with manual flag
        stopCurrentAudio(true, true); // resetButton=true, isManualStop=true
        
        // Stop browser TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        setIsPlaying(false);
        setIsLoading(false);
        setShowStopButton(false); // Resetear a "Escuchar"
        onPlayEnd?.();
    }, [stopCurrentAudio, onPlayEnd]);

    const handleClick = () => {
        if (isPlaying || showStopButton) {
            handleStop();
        } else {
            handlePlay();
        }
    };

    // Exponer función para detener desde el exterior
    React.useImperativeHandle(ref, () => ({
        stop: () => {
            console.log('🛑 Audio detenido desde el exterior (cambio de pantalla)');
            
            // Detener audio global primero
            globalAudioManager.stopAllAudio();
            
            // Luego detener audio local
            stopCurrentAudio(true, true); // resetButton=true, isManualStop=true
            
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            setIsPlaying(false);
            setIsLoading(false);
            setShowStopButton(false);
        }
    }), [stopCurrentAudio]);

    return (
        <button
            ref={ref}
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={`tts-button ${className} ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
            title={(isPlaying || showStopButton) ? "Detener audio" : "Reproducir texto"}
        >
            {isLoading ? (
                <>
                    <Loader2 className="tts-loading-icon" size={20} />
                    <span className="tts-text">Cargando...</span>
                </>
            ) : (isPlaying || showStopButton) ? (
                <>
                    <VolumeX size={20} />
                    <span className="tts-text">Detener</span>
                </>
            ) : (
                <>
                    <Volume2 size={20} />
                    <span className="tts-text">Escuchar</span>
                </>
            )}
        </button>
    );
});
