import { questions } from "../data/questions";

// Configuración del API para conectar con el backend Flask
const API_BASE_URL = 'http://localhost:5000';

class ApiService {
    async predictScore(gameData) {
        try {
            console.log('🚀 Enviando datos al backend:', gameData);

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
            console.log('✅ Predicción recibida:', data);
            return data;
        } catch (error) {
            console.error('❌ Error al predecir puntaje:', error);
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
            console.error('❌ Backend no disponible:', error);
            return { status: 'ERROR', modelo_disponible: false };
        }
    }

    // Método para enviar datos del juego y obtener predicción
    async updateGameScore(playerData) {
        // Mapear los datos del frontend a los campos que espera el modelo
        const gameData = {
            tiempo_respuesta: playerData.responseTime,
            provincia_dificultad: this.getProvinceDifficulty(playerData.currentQuestion),
            edad: playerData.playerAge,
            vidas_usadas: 3 - playerData.livesRemaining, // Convertir vidas restantes a vidas usadas
            es_correcto: playerData.isCorrect ? 1 : 0
        };

        return await this.predictScore(gameData);
    }

    getProvinceDifficulty(questionIndex) {
        const question = questions[questionIndex]
        return question ? question.difficulty : null;
    }
}

export const apiService = new ApiService();
