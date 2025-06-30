import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { MapPin, Trophy, Heart } from "lucide-react";
import { useContext, useEffect, useRef, useCallback } from "react";
import { GameContext } from "../../context/gameContext";
import { questions } from "../../data/questions";
import { TTSButton } from "../TTSButton";

export const GameScreen = () => {

    const { gameState, setGameState, lives, setTimeLeft, setScore, setLives, currentQuestion, timePerQuestion, timeLeft, score, setCurrentQuestion } = useContext(GameContext);
    
    const previousQuestionRef = useRef(-1); // Initialize with -1 to ensure first question plays

    const handleAnswerBasedOnButton = (button) => {
        if (gameState !== "playing") return;

        const correctProvinceIndex = currentQuestion + 1;

        if (parseInt(button, 10) === correctProvinceIndex) {
            processAnswer(true);
        } else {
            processAnswer(false);
        }
    };

    const processAnswer = useCallback((isCorrect) => {
        if (isCorrect) {
            setScore((prev) => prev + 1);
            setGameState("correct");
            setTimeout(() => {
                if (currentQuestion + 1 < questions.length) {
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
    }, [currentQuestion, lives, setScore, setGameState, setCurrentQuestion, setLives]);

    useEffect(() => {
        if (gameState === "playing") {
            setTimeLeft(timePerQuestion);

            const interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        processAnswer(false); // tiempo agotado = incorrecto
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [gameState, currentQuestion, processAnswer, setTimeLeft, timePerQuestion]);

    // Solo logging para debug - TTS se maneja automáticamente
    useEffect(() => {
        if (gameState === "playing") {
            if (previousQuestionRef.current !== currentQuestion) {
                console.log(`🎵 Nueva pregunta detectada: ${previousQuestionRef.current} → ${currentQuestion}`);
                previousQuestionRef.current = currentQuestion;
            }
        }
    }, [gameState, currentQuestion]);

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
                        Pregunta {currentQuestion + 1} de {questions.length}
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
                                {questions[currentQuestion]?.question}
                            </h2>
                            
                            {/* TTS Button con lógica integrada */}
                            <TTSButton
                                text={`${questions[currentQuestion]?.question}. Pista: ${questions[currentQuestion]?.hint}`}
                                disabled={gameState !== "playing"}
                                className="question-tts-button"
                                onPlayStart={(text) => console.log(`🎵 TTS iniciado para pregunta ${currentQuestion + 1}: "${text.substring(0, 50)}..."`)}
                                onPlayEnd={() => console.log(`✅ TTS terminado para pregunta ${currentQuestion + 1}`)}
                                onError={(error) => console.error(`❌ Error TTS en pregunta ${currentQuestion + 1}:`, error)}
                            />
                            
                            <div className="hint-box">
                                <p className="hint-text">
                                    💡 Pista: {questions[currentQuestion]?.hint}
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
                                        margin: "0 auto 15px",
                                    }}
                                />
                                <p className="instruction-title">
                                    Busca la provincia en el mapa
                                </p>
                                <p className="instruction-text">
                                    Toca la provincia correcta en tu tablero
                                </p>
                            </div>

                            {/* Opcional: botones de simulación para pruebas */}
                            <div className="simulation-buttons" style={{ marginTop: "20px" }}>
                                <button
                                    onClick={() =>
                                        handleAnswerBasedOnButton((currentQuestion + 1).toString())
                                    }
                                    className="btn btn-success"
                                    disabled={gameState === "waiting"}
                                >
                                    ✓ Simular Correcto
                                </button>
                                <button
                                    onClick={() => handleAnswerBasedOnButton("0")} // botón incorrecto
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