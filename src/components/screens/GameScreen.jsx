import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { MapPin, Trophy, Heart } from "lucide-react";
import { useContext, useEffect, useRef, useCallback, useState } from "react";
import { GameContext } from "../../context/gameContext";
import { TTSButton } from "../TTSButton";

export const GameScreen = () => {

    const { 
        playerName, gameState, setGameState, lives, setLives, 
        currentQuestion, timePerQuestion, score, setCurrentQuestion,
        startResponseTimer, updateScoreWithML, processAnswerRef,
        selectedQuestions
    } = useContext(GameContext);
    
    // Timer local para evitar problemas de sincronización
    const [timeLeft, setTimeLeft] = useState(timePerQuestion);
    
    const previousQuestionRef = useRef(-1); // Initialize with -1 to ensure first question plays
    const timerRef = useRef(null); // Ref para manejar el timer
    const ttsButtonRef = useRef(null); // Ref para controlar el TTSButton

    const processAnswer = useCallback(async (isCorrect) => {
        // Clear any existing timer when processing answer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        // Actualizar puntaje usando ML
        await updateScoreWithML(isCorrect);
        
        if (isCorrect) {
            setGameState("correct");
            setTimeout(() => {
                if (currentQuestion + 1 < selectedQuestions.length) {
                    setCurrentQuestion((prev) => prev + 1);
                    setLives(3);
                    setGameState("playing");
                } else {
                    setGameState("finished");
                }
            }, 2000);
        } else {
            if (lives - 1 <= 0) {
                setLives(0);
                setGameState("finished");
            } else {
                setLives((prev) => prev - 1);
                setGameState("incorrect");
                setTimeout(() => {
                    setGameState("playing");
                }, 2000);
            }
        }
    }, [updateScoreWithML, currentQuestion, lives, setGameState, setCurrentQuestion, setLives, selectedQuestions]);

    // Update the ref whenever processAnswer changes
    useEffect(() => {
        processAnswerRef.current = processAnswer;
    }, [processAnswer, processAnswerRef]);

    useEffect(() => {
        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        if (gameState === "playing") {
            // Reset timer to full time
            setTimeLeft(timePerQuestion);
            startResponseTimer(); // Iniciar cronómetro para ML

            console.log(`⏱️ Iniciando timer para pregunta ${currentQuestion + 1} con ${timePerQuestion} segundos`);

            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    console.log(`⏱️ Timer: ${prevTime} → ${prevTime - 1}`);
                    
                    if (prevTime <= 1) {
                        // Clear the timer immediately when time runs out
                        console.log(`⏰ Tiempo agotado en pregunta ${currentQuestion + 1}`);
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        // Use the ref to call processAnswer to avoid dependency issues
                        setTimeout(() => {
                            if (processAnswerRef.current) {
                                processAnswerRef.current(false); // tiempo agotado = incorrecto
                            }
                        }, 0);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, currentQuestion, timePerQuestion, startResponseTimer]);

    // Solo logging para debug - TTS se maneja automáticamente
    useEffect(() => {
        if (gameState === "playing") {
            if (previousQuestionRef.current !== currentQuestion) {
                console.log(`🎵 Nueva pregunta detectada: ${previousQuestionRef.current} → ${currentQuestion}`);
                previousQuestionRef.current = currentQuestion;
            }
        }
    }, [gameState, currentQuestion]);

    // Debug effect para monitorear el timer
    useEffect(() => {
        console.log(`🕐 TimeLeft actualizado: ${timeLeft}s (Estado: ${gameState}, Pregunta: ${currentQuestion + 1})`);
    }, [timeLeft, gameState, currentQuestion]);

    // Detener audio cuando se salga del estado "playing"
    useEffect(() => {
        if (gameState !== "playing" && ttsButtonRef.current) {
            console.log(`🔇 Deteniendo audio por cambio de estado: ${gameState}`);
            ttsButtonRef.current.stop();
        }
    }, [gameState]);

    // Function to handle simulation button clicks
    const handleAnswerBasedOnButton = useCallback((buttonId) => {
        const correctAnswer = selectedQuestions[currentQuestion]?.correctAnswer;
        const isCorrect = buttonId === correctAnswer?.toString();
        processAnswer(isCorrect);
    }, [selectedQuestions, currentQuestion, processAnswer]);

    // Protección: si no hay preguntas seleccionadas, mostrar cargando
    if (!selectedQuestions || selectedQuestions.length === 0) {
        return (
            <div className="bg-game">
                <div className="container">
                    <div className="flex-center">
                        <div className="card card-game text-center">
                            <h2>Preparando preguntas...</h2>
                            <p>Seleccionando preguntas aleatorias para ti.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-game">
            <div className="container">
                <div className="game-header flex-between">
                    <div className="lives-container">
                        <div
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                                color: "#2C3E50",
                            }}
                        >
                            Vidas:
                        </div>
                        <div className="flex" style={{ gap: "5px", marginRight: "15px" }}>
                            {[...Array(lives)].map((_, i) => (
                                <Heart key={i} className="heart" />
                            ))}
                        </div>
                    </div>

                    <div className="score-container">
                        <Trophy className="trophy" />
                        <span>{score} puntos</span>
                    </div>

                    <div className="progress-text">
                        Pregunta {currentQuestion + 1} de {selectedQuestions?.length || 10}
                    </div>
                </div>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={(timeLeft / timePerQuestion) * 100}
                        sx={{
                            height: 16,
                            borderRadius: 5,
                        }}
                    />
                    <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '4px', color: '#2C3E50' }}>
                        {timeLeft}s
                    </div>
                </Box>

                <div className="flex-center">
                    <div className="card card-game text-center">
                        <div>
                            <h2 className="question-text">
                                {selectedQuestions[currentQuestion]?.question || "Cargando pregunta..."}
                            </h2>
                            
                            {/* TTS Button con lógica integrada */}
                            <TTSButton
                                ref={ttsButtonRef}
                                text={selectedQuestions[currentQuestion] ? 
                                    `${selectedQuestions[currentQuestion].question}. Pista: ${selectedQuestions[currentQuestion].hint}
                                    Busca la provincia en tu mapa y selecciónala.
                                    Tu puedes ${playerName}.` : 
                                    "Cargando pregunta..."
                                }
                                disabled={gameState !== "playing"}
                                className="question-tts-button"
                                onPlayStart={(text) => console.log(`🎵 TTS iniciado para pregunta ${currentQuestion + 1}: "${text.substring(0, 50)}..."`)}
                                onPlayEnd={() => console.log(`✅ TTS terminado para pregunta ${currentQuestion + 1}`)}
                                onError={(error) => console.error(`❌ Error TTS en pregunta ${currentQuestion + 1}:`, error)}
                            />
                            
                            <div className="hint-box">
                                <p className="hint-text">
                                    💡 <strong>Pista:</strong> {selectedQuestions[currentQuestion]?.hint || "Cargando pista..."}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="map-instruction">
                                <MapPin
                                    className="icon"
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        color: "#9C27B0",
                                        margin: "0 auto 0",
                                    }}
                                />
                                <p className="instruction-title">
                                    Busca la provincia en tu mapa
                                </p>
                                <p className="instruction-text">
                                    Y selecciónala para responder la pregunta.
                                </p>
                            </div>

                            {/* Opcional: botones de simulación para pruebas */}
                            <div className="simulation-buttons" style={{ marginTop: "20px" }}>
                                <button
                                    onClick={() => {
                                        const correctAnswer = selectedQuestions[currentQuestion]?.correctAnswer;
                                        if (correctAnswer !== undefined) {
                                            handleAnswerBasedOnButton(correctAnswer.toString());
                                        }
                                    }}
                                    className="btn btn-success"
                                    disabled={gameState === "waiting" || !selectedQuestions[currentQuestion]}
                                >
                                    ✓ Simular Correcto ({selectedQuestions[currentQuestion]?.province})
                                </button>
                                <button
                                    onClick={() => handleAnswerBasedOnButton("99")}
                                    className="btn btn-danger"
                                    disabled={gameState === "waiting"}
                                    style={{ marginLeft: "10px" }}
                                >
                                    ✗ Simular Incorrecto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}