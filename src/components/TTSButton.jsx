import React, { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import './TTSButton.css';

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
    const [currentAudio, setCurrentAudio] = useState(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(null); // Para manejar la limpieza de URLs
    const lastTextRef = useRef(''); // Para detectar cambios de texto
    const isPlayingRef = useRef(false); // Para evitar dependencias problemáticas en useEffect
    const isLoadingRef = useRef(false); // Para evitar dependencias problemáticas en useEffect
    const autoPlayTimerRef = useRef(null); // Para controlar el timer de auto-play

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
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.src = '';
            }
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

    const stopCurrentAudio = useCallback(() => {
        // Stop ElevenLabs audio
        if (currentAudio) {
            // Usar la función especial para marcar como detenido manualmente
            if (typeof currentAudio.stopManually === 'function') {
                console.log('🔇 Deteniendo audio de ElevenLabs manualmente...');
                currentAudio.stopManually();
            } else {
                // Fallback para audios que no tienen la función
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            setCurrentAudio(null);
        }
        
        // Stop browser TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        setIsPlaying(false);
        setIsLoading(false);
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
                    console.log(`📊 FALLBACK: Estado después de setIsPlaying(false): playing=false`);
                    onPlayEnd?.();
                };

                utterance.onerror = (event) => {
                    console.error('❌ Error en TTS del navegador:', event);
                    setIsPlaying(false);
                    setIsLoading(false);
                    onError?.(event);
                };

                console.log('🔊 FALLBACK: Iniciando setIsPlaying(true)...');
                setIsPlaying(true);
                console.log('🔊 FALLBACK: Llamando window.speechSynthesis.speak()...');
                window.speechSynthesis.speak(utterance);
                console.log('▶️ TTS del navegador iniciado');
            } else {
                console.error('❌ FALLBACK: speechSynthesis NO disponible en este navegador');
                throw new Error('Speech synthesis not supported');
            }
        } catch (error) {
            console.error('❌ Browser TTS fallback failed:', error);
            setIsPlaying(false);
            setIsLoading(false);
            onError?.(error);
        }
    }, [onPlayEnd, onError]);

    const playTextToSpeech = useCallback(async (textToSpeak) => {
        try {
            console.log(`🎬 playTextToSpeech iniciado con: "${textToSpeak.substring(0, 50)}..."`);
            setIsLoading(true);
            console.log(`📊 Estado después de setIsLoading(true): loading=true`);
            onPlayStart?.(textToSpeak);

            // Stop any current audio AND browser TTS
            stopCurrentAudio();
            
            // Ensure browser TTS is cancelled before starting ElevenLabs
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

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
                    setCurrentAudio(null);
                    // No limpiar la URL aquí, se limpiará cuando se desmonte el componente o se cree un nuevo audio
                    onPlayEnd?.();
                };

                audio.onerror = (e) => {
                    // Solo manejar como error real si el audio nunca se reprodujo exitosamente Y no fue detenido manualmente
                    if (!audioPlayedSuccessfully && !manuallyStopped) {
                        console.error('❌ Error real reproduciendo audio de ElevenLabs:', e);
                        setIsPlaying(false);
                        setCurrentAudio(null);
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
                    setCurrentAudio(null);
                    fallbackToBrowserTTS(textToSpeak);
                    return;
                }
                
                // SUCCESS: Return here to avoid fallback
                return;
            } else {
                const errorText = await response.text();
                console.error('❌ Error de ElevenLabs API:', response.status, errorText);
                throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
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
        // Stop ElevenLabs audio
        stopCurrentAudio();
        
        // Stop browser TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        setIsPlaying(false);
        setIsLoading(false);
        onPlayEnd?.();
    }, [stopCurrentAudio, onPlayEnd]);

    const handleClick = () => {
        if (isPlaying) {
            handleStop();
        } else {
            handlePlay();
        }
    };

    return (
        <button
            ref={ref}
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={`tts-button ${className} ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
            title={isPlaying ? "Detener audio" : "Reproducir texto"}
        >
            {isLoading ? (
                <>
                    <Loader2 className="tts-loading-icon" size={20} />
                    <span className="tts-text">Cargando...</span>
                </>
            ) : isPlaying ? (
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
