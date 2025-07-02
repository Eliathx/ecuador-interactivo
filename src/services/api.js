import { questions } from "../data/questions";

// Configuración del API para conectar con el backend Flask
const API_BASE_URL = 'http://localhost:5000';

/**
 * Mapeo de dificultad por provincia
 * Escala 1-5: 1=Muy Fácil, 2=Fácil, 3=Medio, 4=Difícil, 5=Muy Difícil
 */
const PROVINCE_DIFFICULTY = {
    // Provincias más conocidas (fáciles)
    "Pichincha": 1,           // Quito es muy conocido
    "Guayas": 1,              // Guayaquil es muy conocido
    "Azuay": 2,               // Cuenca es conocida
    "Manabí": 2,              // Costa conocida
    "Tungurahua": 2,          // Baños es popular
    
    // Provincias medianamente conocidas
    "Esmeraldas": 3,
    "El Oro": 3,
    "Imbabura": 3,
    "Cotopaxi": 3,
    "Chimborazo": 3,
    "Los Ríos": 3,
    "Santa Elena": 3,
    
    // Provincias menos conocidas (difíciles)
    "Carchi": 4,
    "Bolívar": 4,
    "Cañar": 4,
    "Loja": 4,
    "Galápagos": 2,           // Muy famoso internacionalmente
    
    // Provincias amazónicas (más difíciles para niños)
    "Sucumbíos": 5,
    "Orellana": 5,
    "Napo": 4,
    "Pastaza": 4,
    "Morona Santiago": 5,
    "Zamora Chinchipe": 5,
    "Santo Domingo de los Tsáchilas": 4
};

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
            provincia_dificultad: this.getProvinceDifficulty(playerData.currentQuestion, playerData.selectedQuestions),
            edad: playerData.playerAge,
            vidas_usadas: 3 - playerData.livesRemaining, // Convertir vidas restantes a vidas usadas
            es_correcto: playerData.isCorrect ? 1 : 0
        };

        return await this.predictScore(gameData);
    }

    /**
     * Obtiene la dificultad de una provincia basada en la pregunta actual
     * @param {number} questionIndex - Índice de la pregunta actual
     * @param {Array} selectedQuestions - Array de preguntas seleccionadas (opcional)
     * @returns {number} Dificultad de 1-5
     */
    getProvinceDifficulty(questionIndex, selectedQuestions = null) {
        let provinceName = null;
        
        // Si tenemos preguntas seleccionadas, usar esas
        if (selectedQuestions && selectedQuestions[questionIndex]) {
            provinceName = selectedQuestions[questionIndex].province;
        } 
        // Fallback: usar el banco completo de preguntas
        else if (questions[questionIndex]) {
            provinceName = questions[questionIndex].province;
        }
        
        // Obtener dificultad de la provincia o usar valor por defecto
        const difficulty = provinceName ? PROVINCE_DIFFICULTY[provinceName] : 3;
        
        console.log(`📊 Dificultad para ${provinceName || 'provincia desconocida'}: ${difficulty}`);
        
        return difficulty || 3; // Valor por defecto: dificultad media
    }
}

export const apiService = new ApiService();
