import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

import { StartScreen } from "./components/screens/StartScreen";
import { PlayerInfoScreen } from "./components/screens/PlayerInfoScreen";
import { GameScreen } from "./components/screens/GameScreen";
import { FeedbackScreen } from "./components/screens/FeedbackScreen";
import { FinishedScreen } from "./components/screens/FinishedScreen";

import { GameContext } from "./context/gameContext";
import { useContext } from "react";
import { Leaderboard } from "./components/Leaderboard";
import VolumeControl from "./components/VolumeControl";
import { getProvinceName } from "./data/provinceMapping";

function App() {

  const { gameState, selectedQuestions, currentQuestion, handleAnswerBasedOnButton } = useContext(GameContext);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    const handleArduinoInput = ({ button }) => {
      console.log(`🎮 Botón Arduino recibido: ${button}`);
      
      // Obtener el nombre de la provincia para logging
      const provinceName = getProvinceName(button);
      console.log(`🗺️ Provincia detectada: ${provinceName || 'DESCONOCIDA'}`);
      
      // Mostrar datos de la pregunta actual para verificar el mapeo
      if (selectedQuestions && selectedQuestions[currentQuestion]) {
        const currentQuestionData = selectedQuestions[currentQuestion];
        console.log(`❓ Pregunta actual: ${currentQuestionData.province} (Respuesta correcta: ${currentQuestionData.correctAnswer})`);
        console.log(`🎯 Mapeo verificación: Botón ${button} vs Respuesta correcta ${currentQuestionData.correctAnswer}`);
      }
      
      // Usar la función del contexto que tiene la lógica correcta
      if (gameState === "playing" && handleAnswerBasedOnButton) {
        handleAnswerBasedOnButton(button.toString());
      }
    };

    socketRef.current.on("arduino-input", handleArduinoInput);

    socketRef.current.on("connect_error", (err) => {
      console.error("Error de conexión Socket:", err);
    });

    return () => {
      socketRef.current.off("arduino-input", handleArduinoInput);
      socketRef.current.disconnect();
    };
  }, [handleAnswerBasedOnButton, currentQuestion, gameState, selectedQuestions]);

  return (
    <>
      {/* Control de volumen global */}
      <VolumeControl />
      
      {gameState === "start" && <StartScreen />}
      {gameState === "player-info" && <PlayerInfoScreen />}
      {gameState === "leaderboard" && <Leaderboard />}
      {gameState === "playing" && <GameScreen />}
      {gameState === "correct" && <FeedbackScreen isCorrect={true} />}
      {gameState === "incorrect" && <FeedbackScreen isCorrect={false} />}
      {gameState === "waiting" && (
        <div className="bg-waiting flex-center">
          <div className="card card-large text-center">
            <p>Esperando respuesta del servidor...</p>
          </div>
        </div>
      )}
      {gameState === "finished" && <FinishedScreen />}
    </>
  );
}

export default App;
