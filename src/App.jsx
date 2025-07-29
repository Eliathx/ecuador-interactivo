import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

import { StartScreen } from "./components/screens/StartScreen";
import { PlayerInfoScreen } from "./components/screens/PlayerInfoScreen";
import { GameScreen } from "./components/screens/GameScreen";
import { FeedbackScreen } from "./components/screens/FeedbackScreen";
import { FinishedScreen } from "./components/screens/FinishedScreen";

import { GameContext } from "./context/gameContext";
import { useContext } from "react";

function App() {

  const { gameState, currentQuestion, processAnswerRef } = useContext(GameContext);

  const socketRef = useRef(null);

  // Handle Arduino button input
  const handleAnswerBasedOnButton = useCallback((button) => {
    if (gameState !== "playing" || !processAnswerRef?.current) return;

    const correctProvinceIndex = currentQuestion + 1;

    if (parseInt(button, 10) === correctProvinceIndex) {
      processAnswerRef.current(true);
    } else {
      processAnswerRef.current(false);
    }
  }, [gameState, currentQuestion, processAnswerRef]);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.on("arduino-input", ({ button }) => {
      console.log("Botón Arduino recibido:", button);
      handleAnswerBasedOnButton(button);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Error de conexión Socket:", err);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [handleAnswerBasedOnButton]);

  return (
    <>
      {gameState === "start" && <StartScreen />}
      {gameState === "player-info" && <PlayerInfoScreen />}
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
