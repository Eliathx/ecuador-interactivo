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
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
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
            // MÚSICA DE FONDO - Coloca tu archivo de música aquí
            // Ruta: src/assets/audio/background-music.wav
            this.backgroundMusic = new Audio('/src/assets/audio/background-music.wav');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.preload = 'auto';
            
            // EFECTO SONIDO CORRECTO - Coloca tu archivo de sonido aquí
            // Ruta: src/assets/audio/correct-answer.wav
            this.correctSound = new Audio('/src/assets/audio/correct-answer.wav');
            this.correctSound.preload = 'auto';
            
            // EFECTO SONIDO INCORRECTO - Coloca tu archivo de sonido aquí
            // Ruta: src/assets/audio/incorrect-answer.wav
            this.incorrectSound = new Audio('/src/assets/audio/incorrect-answer.wav');
            this.incorrectSound.preload = 'auto';
            
            this.updateVolumes();
            
            console.log('🎵 Audio Manager inicializado correctamente');
        } catch (error) {
            console.warn('⚠️ Algunos archivos de audio no están disponibles. Coloca los archivos de audio en src/assets/audio/');
            console.error('❌ Error inicializando Audio Manager:', error);
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
     * Reproduce la música de fondo (para el menú principal)
     */
    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMusicPlaying) {
            this.backgroundMusic.play()
                .then(() => {
                    this.isMusicPlaying = true;
                    console.log('🎵 Música de fondo iniciada');
                })
                .catch(error => {
                    console.warn('⚠️ No se pudo reproducir la música de fondo. Asegúrate de tener el archivo background-music.wav en src/assets/audio/');
                    console.error('❌ Error reproduciendo música de fondo:', error);
                });
        }
    }

    /**
     * Pausa la música de fondo (durante el juego)
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.isMusicPlaying = false;
            console.log('⏸️ Música de fondo pausada');
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
            console.log('⏹️ Música de fondo detenida');
        }
    }

    /**
     * Reproduce el efecto de sonido para respuesta correcta
     */
    playCorrectSound() {
        if (this.correctSound) {
            this.correctSound.currentTime = 0; // Reinicia el sonido
            this.correctSound.play()
                .then(() => {
                    console.log('✅ Sonido de respuesta correcta reproducido');
                })
                .catch(error => {
                    console.warn('⚠️ No se pudo reproducir el sonido de respuesta correcta. Asegúrate de tener el archivo correct-answer.wav en src/assets/audio/');
                    console.error('❌ Error reproduciendo sonido correcto:', error);
                });
        }
    }

    /**
     * Reproduce el efecto de sonido para respuesta incorrecta
     */
    playIncorrectSound() {
        if (this.incorrectSound) {
            this.incorrectSound.currentTime = 0; // Reinicia el sonido
            this.incorrectSound.play()
                .then(() => {
                    console.log('❌ Sonido de respuesta incorrecta reproducido');
                })
                .catch(error => {
                    console.warn('⚠️ No se pudo reproducir el sonido de respuesta incorrecta. Asegúrate de tener el archivo incorrect-answer.wav en src/assets/audio/');
                    console.error('❌ Error reproduciendo sonido incorrecto:', error);
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
        console.log('🧹 Audio Manager limpiado');
    }
}

// Instancia singleton del gestor de audio
export const audioManager = new AudioManager();
