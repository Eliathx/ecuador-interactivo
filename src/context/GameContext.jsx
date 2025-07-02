/**
 * CONTEXTO DEL JUEGO INTERACTIVO DE ECUADOR
 * =====================================
 * 
 * Este contexto maneja todo el estado del juego de geografía de Ecuador,
 * incluyendo la selección aleatoria de preguntas, el sistema de puntuación
 * con Machine Learning, y la integración con hardware Arduino.
 * 
 * Características principales:
 * - Selección aleatoria de 10 preguntas por partida
 * - Mapeo correcto de provincias ecuatorianas (24 provincias)
 * - Sistema de puntuación inteligente con ML
 * - Integración con Arduino para respuestas físicas
 * - Manejo de vidas y tiempo por pregunta
 * - Soporte para Text-to-Speech (TTS)
 */

import { createContext, useState, useRef, useCallback } from "react";
import { apiService } from "../services/api";
import { questions } from "../data/questions";
import { selectRandomQuestions } from "../data/provinceMapping";

/**
 * Contexto principal del juego
 * Proporciona estado y funciones a todos los componentes del juego
 */
export const GameContext = createContext();

/**
 * PROVEEDOR DEL CONTEXTO DEL JUEGO
 * ===============================
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {number} props.timePerQuestion - Tiempo en segundos por pregunta
 * 
 * @returns {JSX.Element} Proveedor del contexto con todos los estados y funciones
 */
export const GameProvider = ({ children, timePerQuestion }) => {
    // ===== ESTADOS PRINCIPALES DEL JUEGO =====
    
    /** @type {[number, Function]} Tiempo restante en la pregunta actual */
    const [timeLeft, setTimeLeft] = useState(timePerQuestion);
    
    /** @type {[string, Function]} Estado actual del juego: "start", "playing", "correct", "incorrect", "finished" */
    const [gameState, setGameState] = useState("start");
    
    /** @type {[number, Function]} Índice de la pregunta actual (0-9) */
    const [currentQuestion, setCurrentQuestion] = useState(0);
    
    /** @type {[number, Function]} Puntaje total acumulado del jugador */
    const [score, setScore] = useState(0);
    
    /** @type {[number, Function]} Vidas restantes del jugador (máximo 3) */
    const [lives, setLives] = useState(3);
    
    /** @type {Object} Referencia para la conexión WebSocket con Arduino */
    const socketRef = useRef(null);

    // ===== SISTEMA DE PREGUNTAS ALEATORIAS =====
    
    /** 
     * @type {[Array, Function]} Array de 10 preguntas seleccionadas aleatoriamente
     * Cada pregunta incluye: id, province, question, hint, gameIndex, provinceNumber, correctAnswer
     */
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // ===== INFORMACIÓN DEL JUGADOR =====
    
    /** @type {[string, Function]} Nombre del jugador */
    const [playerName, setPlayerName] = useState("");
    
    /** @type {[string, Function]} Edad del jugador (3-18 años) */
    const [playerAge, setPlayerAge] = useState("");
    
    // ===== SISTEMA DE MACHINE LEARNING =====
    
    /** @type {[number|null, Function]} Timestamp del inicio de respuesta para calcular tiempo de reacción */
    const [responseStartTime, setResponseStartTime] = useState(null);

    // ===== FUNCIONES PRINCIPALES =====

    /**
     * Inicializa una nueva partida del juego
     * - Selecciona 10 preguntas aleatorias de las 48 disponibles
     * - Mapea cada pregunta con su número de provincia correspondiente
     * - Resetea todos los contadores del juego
     * 
     * @function initializeGame
     * @returns {void}
     */
    const initializeGame = useCallback(() => {
        const randomQuestions = selectRandomQuestions(questions, 10);
        setSelectedQuestions(randomQuestions);
        setCurrentQuestion(0);
        setScore(0);
        setLives(3);
    }, []);

    /**
     * Inicia el cronómetro para medir tiempo de respuesta
     * Usado por el sistema de Machine Learning para calcular puntuación
     * 
     * @function startResponseTimer
     * @returns {void}
     */
    const startResponseTimer = () => {
        setResponseStartTime(Date.now());
    };

    /**
     * Sistema de puntuación inteligente con Machine Learning
     * 
     * Envía datos de la respuesta actual al backend de ML para obtener
     * una puntuación basada en múltiples factores:
     * - Tiempo de respuesta
     * - Corrección de la respuesta
     * - Número de pregunta actual
     * - Vidas restantes
     * - Edad del jugador
     * - Dificultad de la provincia
     * 
     * @async
     * @function updateScoreWithML
     * @param {boolean} isCorrect - Si la respuesta fue correcta o no
     * @returns {Promise<void>}
     */
    const updateScoreWithML = async (isCorrect) => {
        try {
            // Calcular tiempo de respuesta desde que inició el timer
            const responseTime = responseStartTime ? (Date.now() - responseStartTime) / 1000 : timePerQuestion;
            
            // Preparar datos para el modelo de ML
            const playerData = {
                currentQuestion,
                responseTime,
                isCorrect,
                livesRemaining: lives,
                playerAge: parseInt(playerAge) || 8,
                selectedQuestions // Pasar las preguntas seleccionadas para calcular dificultad
            };
            console.log('📊 Enviando datos al backend:', playerData);
            
            // Obtener predicción del modelo
            const prediction = await apiService.updateGameScore(playerData);
            const questionScore = prediction.puntos_estimados;
            
            // Actualizar el puntaje total acumulado
            setScore(prev => prev + questionScore);
            
            console.log('🤖 Puntaje de esta pregunta:', questionScore);
            console.log('📈 Puntaje total actualizado');
            
        } catch (error) {
            console.error('❌ Error al predecir puntaje, usando fallback:', error);
            // Fallback: usar puntaje simple si falla el ML
            const fallbackScore = isCorrect ? 10 : 0;
            setScore(prev => prev + fallbackScore);
        }
    };

    // ===== INTEGRACIÓN CON HARDWARE ARDUINO =====

    /** @type {Object} Referencia para la función de procesamiento de respuestas */
    const processAnswerRef = useRef(null);

    /**
     * Maneja las respuestas físicas del tablero Arduino
     * 
     * Cada provincia de Ecuador tiene un botón numerado (0-23) en el tablero físico.
     * Esta función valida si el botón presionado corresponde a la respuesta correcta
     * de la pregunta actual.
     * 
     * Mapeo de provincias:
     * 0=Carchi, 1=Sucumbíos, 2=Orellana, 3=Imbabura, 4=Napo, 5=Cotopaxi,
     * 6=Pastaza, 7=Morona Santiago, 8=Azuay, 9=Chimborazo, 10=Zamora Chinchipe,
     * 11=Tungurahua, 12=Loja, 13=Cañar, 14=El Oro, 15=Bolívar, 16=Guayas,
     * 17=Los Ríos, 18=Santa Elena, 19=Santo Domingo de los Tsáchilas,
     * 20=Esmeraldas, 21=Pichincha, 22=Galápagos, 23=Manabí
     * 
     * @function handleAnswerBasedOnButton
     * @param {string} button - Número del botón presionado (como string)
     * @returns {void}
     */
    const handleAnswerBasedOnButton = useCallback((button) => {
        // Obtener datos de la pregunta actual
        const currentQuestionData = selectedQuestions[currentQuestion];

        // Comparar respuesta del Arduino con la correcta
        const correctProvinceNumber = currentQuestionData.correctAnswer;
        const buttonNumber = parseInt(button, 10);

        // Procesar respuesta correcta o incorrecta
        if (buttonNumber === correctProvinceNumber) {
            if (processAnswerRef.current) {
                processAnswerRef.current(true);
            }
        } else {
            if (processAnswerRef.current) {
                processAnswerRef.current(false);
            }
        }
    }, [currentQuestion, selectedQuestions]);

    // ===== PROVEEDOR DEL CONTEXTO =====

    /**
     * Retorna el proveedor del contexto con todos los estados y funciones
     * disponibles para los componentes hijos
     */
    return (
        <GameContext.Provider
            value={{
                // ===== ESTADOS DE TIEMPO Y JUEGO =====
                timeLeft,                    // Tiempo restante en pregunta actual
                timePerQuestion,             // Tiempo total por pregunta (constante)
                setTimeLeft,                 // Función para actualizar tiempo restante
                gameState,                   // Estado actual del juego
                setGameState,                // Función para cambiar estado del juego
                
                // ===== NAVEGACIÓN Y PROGRESO =====
                currentQuestion,             // Índice de pregunta actual (0-9)
                setCurrentQuestion,          // Función para cambiar pregunta
                score,                       // Puntaje total acumulado
                setScore,                    // Función para actualizar puntaje
                lives,                       // Vidas restantes (0-3)
                setLives,                    // Función para actualizar vidas
                
                // ===== CONEXIÓN Y HARDWARE =====
                socketRef,                   // Referencia WebSocket para Arduino
                
                // ===== INFORMACIÓN DEL JUGADOR =====
                playerName,                  // Nombre del jugador
                setPlayerName,               // Función para establecer nombre
                playerAge,                   // Edad del jugador
                setPlayerAge,                // Función para establecer edad
                
                // ===== SISTEMA DE PREGUNTAS =====
                selectedQuestions,           // Array de 10 preguntas seleccionadas
                setSelectedQuestions,        // Función para actualizar preguntas
                initializeGame,              // Función para inicializar nueva partida
                
                // ===== MACHINE LEARNING =====
                startResponseTimer,          // Función para iniciar cronómetro de respuesta
                updateScoreWithML,           // Función de puntuación inteligente
                
                // ===== ARDUINO Y HARDWARE =====
                handleAnswerBasedOnButton,   // Función para manejar respuestas del Arduino
                processAnswerRef,            // Referencia para procesamiento de respuestas
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
