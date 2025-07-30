/**
 * GESTOR DE AUDIO PARA EL JUEGO DE ECUADOR
 * =======================================
 * 
 * Maneja toda la reproducción de audio del juego:
 * - Música de fondo para el menú principal
 * - Efectos de sonido para respuestas correctas e incorrectas
 * - Control de volumen global
 * - Pausa/reanudación de música durante el juego
 */

class AudioManager {
    constructor() {
        // Referencias a los elementos de audio
        this.backgroundMusic = null;
        this.correctSound = null;
        this.incorrectSound = null;
        
        // Control de volumen (0-1)
        this.masterVolume = 0.7;
        this.musicVolume = 0.4;  // Reducido para que los efectos se escuchen mejor
        this.sfxVolume = 1.0;    // Aumentado al máximo para efectos más prominentes
        
        // Estados
        this.isMusicPlaying = false;
        this.isMuted = false;
        
        this.initializeAudio();
    }

    /**
     * Inicializa todos los elementos de audio
     */
    initializeAudio() {
        try {
            // MÚSICA DE FONDO
            this.backgroundMusic = new Audio('/src/assets/audio/background-music.wav');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.preload = 'auto';
            
            // EFECTO SONIDO CORRECTO
            this.correctSound = new Audio('/src/assets/audio/correct-answer.wav');
            this.correctSound.preload = 'auto';

            // EFECTO SONIDO INCORRECTO
            this.incorrectSound = new Audio('/src/assets/audio/incorrect-answer.wav');
            this.incorrectSound.preload = 'auto';
            
            this.updateVolumes();
            
            console.log('Audio Manager inicializado correctamente');
        } catch (error) {
            console.warn('Algunos archivos de audio no están disponibles.');
            console.error('Error inicializando Audio Manager:', error);
        }
    }

    /**
     * Actualiza todos los volúmenes según la configuración actual
     */
    updateVolumes() {
        const finalMusicVolume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
        const finalSfxVolume = this.isMuted ? 0 : this.masterVolume * this.sfxVolume;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = finalMusicVolume;
        }
        if (this.correctSound) {
            this.correctSound.volume = finalSfxVolume;
        }
        if (this.incorrectSound) {
            this.incorrectSound.volume = finalSfxVolume;
        }
    }

    /**
     * Reproduce la música de fondo (para el menú principal y después de efectos de sonido)
     */
    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMusicPlaying) {
            this.backgroundMusic.play()
                .then(() => {
                    this.isMusicPlaying = true;
                    console.log('🎵 Música de fondo iniciada/reanudada');
                })
                .catch(error => {
                    console.warn('No se pudo reproducir la música de fondo.');
                    console.error('Error reproduciendo música de fondo:', error);
                });
        }
    }

    /**
     * Pausa la música de fondo (durante efectos de sonido y durante el juego)
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.isMusicPlaying = false;
            console.log('🔇 Música de fondo pausada para efectos de sonido');
            
            // Asegurar que el volumen esté a 0 mientras está pausada
            this.backgroundMusic.volume = 0;
        }
    }

    /**
     * Reduce el volumen de la música de fondo (para TTS y efectos de sonido)
     */
    duckBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            const duckedVolume = this.isMuted ? 0 : this.masterVolume * this.musicVolume * 0.05; // 5% del volumen original para mejor contraste
            this.backgroundMusic.volume = duckedVolume;
            console.log('🎵 Música de fondo reducida para efectos de sonido');
        }
    }

    /**
     * Restaura el volumen normal de la música de fondo (después del TTS y efectos de sonido)
     */
    restoreBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            const normalVolume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
            this.backgroundMusic.volume = normalVolume;
            console.log('🎵 Música de fondo restaurada');
        }
    }

    /**
     * Detiene completamente la música de fondo
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.isMusicPlaying = false;
            console.log('Música de fondo detenida');
        }
    }

    /**
     * Reanuda la música de fondo con fade-in suave después de efectos de sonido
     */
    resumeBackgroundMusicSmooth() {
        if (this.backgroundMusic && !this.isMusicPlaying) {
            // Empezar con volumen muy bajo
            this.backgroundMusic.volume = 0;
            
            this.backgroundMusic.play()
                .then(() => {
                    this.isMusicPlaying = true;
                    console.log('🎵 Música de fondo reanudando con fade-in suave');
                    
                    // Fade-in gradual durante 1 segundo
                    const targetVolume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
                    const fadeSteps = 20;
                    const fadeInterval = 50; // 50ms entre pasos
                    const volumeStep = targetVolume / fadeSteps;
                    
                    let currentStep = 0;
                    const fadeInTimer = setInterval(() => {
                        currentStep++;
                        const newVolume = volumeStep * currentStep;
                        
                        if (this.backgroundMusic) {
                            this.backgroundMusic.volume = Math.min(newVolume, targetVolume);
                        }
                        
                        if (currentStep >= fadeSteps) {
                            clearInterval(fadeInTimer);
                            console.log('🎵 Fade-in completado');
                        }
                    }, fadeInterval);
                })
                .catch(error => {
                    console.warn('No se pudo reanudar la música de fondo.');
                    console.error('Error reanudando música de fondo:', error);
                });
        }
    }

    /**
     * Reproduce el efecto de sonido para respuesta correcta
     */
    async playCorrectSound() {
        if (this.correctSound) {
            console.log('🎵 Iniciando reproducción de sonido correcto...');
            
            // Pausar música de fondo completamente
            this.pauseBackgroundMusic();
            
            // Esperar un momento para asegurar que la música se pause completamente
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('✅ Música pausada, reproduciendo efecto de sonido...');
            
            this.correctSound.currentTime = 0; // Reinicia el sonido
            this.correctSound.play()
                .then(() => {
                    console.log('✅ Sonido de respuesta correcta reproducido');
                    // Reanudar música después de 4 segundos con fade-in suave
                    setTimeout(() => {
                        this.resumeBackgroundMusicSmooth();
                    }, 4000);
                })
                .catch(error => {
                    console.warn('No se pudo reproducir el sonido de respuesta correcta.');
                    console.error('Error reproduciendo sonido correcto:', error);
                    // Reanudar música incluso si hay error
                    setTimeout(() => {
                        this.resumeBackgroundMusicSmooth();
                    }, 4000);
                });
        }
    }

    /**
     * Reproduce el efecto de sonido para respuesta incorrecta
     */
    async playIncorrectSound() {
        if (this.incorrectSound) {
            console.log('🎵 Iniciando reproducción de sonido incorrecto...');
            
            // Pausar música de fondo completamente
            this.pauseBackgroundMusic();
            
            // Esperar un momento para asegurar que la música se pause completamente
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('❌ Música pausada, reproduciendo efecto de sonido...');
            
            this.incorrectSound.currentTime = 0; // Reinicia el sonido
            this.incorrectSound.play()
                .then(() => {
                    console.log('❌ Sonido de respuesta incorrecta reproducido');
                    // Reanudar música después de 4 segundos con fade-in suave
                    setTimeout(() => {
                        this.resumeBackgroundMusicSmooth();
                    }, 4000);
                })
                .catch(error => {
                    console.warn('No se pudo reproducir el sonido de respuesta incorrecta.');
                    console.error('Error reproduciendo sonido incorrecto:', error);
                    // Reanudar música incluso si hay error
                    setTimeout(() => {
                        this.resumeBackgroundMusicSmooth();
                    }, 4000);
                });
        }
    }

    /**
     * Establece el volumen maestro (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        console.log(`🔊 Volumen maestro: ${Math.round(this.masterVolume * 100)}%`);
    }

    /**
     * Establece el volumen de la música (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        console.log(`🎵 Volumen música: ${Math.round(this.musicVolume * 100)}%`);
    }

    /**
     * Establece el volumen de efectos de sonido (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        console.log(`🔊 Volumen SFX: ${Math.round(this.sfxVolume * 100)}%`);
    }

    /**
     * Activa/desactiva el silencio general
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolumes();
        console.log(`🔇 Audio ${this.isMuted ? 'silenciado' : 'activado'}`);
        return this.isMuted;
    }

    /**
     * Obtiene el estado actual del audio
     */
    getAudioState() {
        return {
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMuted: this.isMuted,
            isMusicPlaying: this.isMusicPlaying
        };
    }

    /**
     * Limpia los recursos de audio
     */
    cleanup() {
        this.stopBackgroundMusic();
        console.log('Audio Manager limpiado');
    }
}

// Instancia singleton del gestor de audio
export const audioManager = new AudioManager();
