import { createContext, useState, useRef } from "react";
import { apiService } from "../services/api";

export const GameContext = createContext();

export const GameProvider = ({ children, timePerQuestion }) => {
    const [timeLeft, setTimeLeft] = useState(timePerQuestion);
    const [gameState, setGameState] = useState("start");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0); // Este será el puntaje total acumulado
    const [lives, setLives] = useState(3);
    const socketRef = useRef(null);

    const [playerName, setPlayerName] = useState("");
    const [playerAge, setPlayerAge] = useState("");
    
    // Estado para rastrear el tiempo de inicio de respuesta
    const [responseStartTime, setResponseStartTime] = useState(null);

    // Función para iniciar el cronómetro de respuesta
    const startResponseTimer = () => {
        setResponseStartTime(Date.now());
    };

    // Función para predecir y actualizar el puntaje total
    const updateScoreWithML = async (isCorrect) => {
        try {
            const responseTime = responseStartTime ? (Date.now() - responseStartTime) / 1000 : timePerQuestion;
            
            const playerData = {
                currentQuestion,
                responseTime,
                isCorrect,
                livesRemaining: lives,
                playerAge: parseInt(playerAge) || 8
            };

            console.log('📊 Enviando datos al backend:', playerData);
            const prediction = await apiService.updateGameScore(playerData);
            const questionScore = prediction.puntos_estimados;
            
            // Actualizar el puntaje total acumulado
            setScore(prev => prev + questionScore);
            
            console.log('🤖 Puntaje de esta pregunta:', questionScore);
            console.log('📈 Puntaje total actualizado');
            
        } catch (error) {
            console.error('❌ Error al predecir puntaje, usando fallback:', error);
            // Fallback: usar puntaje simple si falla
            const fallbackScore = isCorrect ? 10 : 0;
            setScore(prev => prev + fallbackScore);
        }
    };

    return (
        <GameContext.Provider
            value={{
                timeLeft,
                timePerQuestion,
                setTimeLeft,
                gameState,
                setGameState,
                currentQuestion,
                setCurrentQuestion,
                score,
                setScore,
                lives,
                setLives,
                socketRef,
                playerName,
                setPlayerName,
                playerAge,
                setPlayerAge,
                // Nuevas funciones ML
                startResponseTimer,
                updateScoreWithML,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
