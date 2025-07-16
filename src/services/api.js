import { questions } from "../data/questions";

// Configuración del API para conectar con el backend Flask
const API_BASE_URL = 'http://localhost:5000';

class ApiService {
    /**
     * Predice la dificultad de la siguiente pregunta usando ML
     * @param {Object} gameData - Datos del juego para el modelo ML
     * @returns {Promise<Object>} - Predicción de dificultad
     */
    async predictDifficulty(gameData) {
        try {
            console.log('==> Enviando datos al backend:', gameData);

            const response = await fetch(`${API_BASE_URL}/predecir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.error || 'Error desconocido'}`);
            }

            const data = await response.json();
            console.log('==> Predicción recibida:', data);
            return data;
        } catch (error) {
            console.error('==> Error al predecir puntaje:', error);
            throw error;
        }
    }

    // Método para verificar que el backend esté funcionando
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('==> Backend no disponible:', error);
            return { status: 'ERROR', modelo_disponible: false };
        }
    }

    /**
     * Actualiza el modelo ML con los datos del juego actual
     * @param {Object} playerData - Datos del jugador y partida
     * @returns {Promise<Object>} - Predicción de dificultad para siguiente pregunta
     */
    async updateGameDifficulty(playerData) {
        // Mapear los datos del frontend a los campos que espera el modelo ML
        const gameData = {
            edad: parseInt(playerData.playerAge) || 8,
            nro_ronda: playerData.currentQuestion + 1, // currentQuestion es 0-based
            vidas_usadas_ronda: 3 - playerData.livesRemaining, // Convertir vidas restantes a usadas
            racha_aciertos: playerData.currentStreak || 0,
            dificultad_pregunta_anterior: this.getCurrentDifficulty(playerData.currentQuestion, playerData.selectedQuestions),
            respuesta_correcta: playerData.isCorrect ? 1 : 0,
            tiempo_respuesta: playerData.responseTime || 30.0
        };

        return await this.predictDifficulty(gameData);
    }

    /**
     * Obtiene la dificultad actual basada en la pregunta
     * @param {number} questionIndex - Índice de la pregunta actual
     * @param {Array} selectedQuestions - Array de preguntas seleccionadas
     * @returns {string} Dificultad en formato texto para el modelo ML
     */
    getCurrentDifficulty(questionIndex, selectedQuestions = null) {
        try {
            const questionsArray = selectedQuestions || questions;
            if (questionIndex >= 0 && questionIndex < questionsArray.length) {
                const question = questionsArray[questionIndex];
                
                // Usar la dificultad directamente del dataset
                const mappedDifficulty = question.difficulty || "media";
                
                console.log(`📊 Pregunta ${questionIndex + 1}: ${question.province} - Dificultad: ${mappedDifficulty}`);
                
                return mappedDifficulty;
            }
            return "media"; // Default fallback
        } catch (error) {
            console.error('==> Error al obtener dificultad:', error);
            return "media";
        }
    }

    /**
     * Obtiene la dificultad de una pregunta específica
     * @param {Object} question - Objeto de pregunta
     * @returns {string} Dificultad en formato texto
     */
    getQuestionDifficulty(question) {
        if (!question || !question.difficulty) {
            return "media";
        }
        
        return question.difficulty || "media";
    }
}

export const apiService = new ApiService();
