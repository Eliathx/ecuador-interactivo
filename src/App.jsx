import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  MapPin,
  Star,
  RotateCcw,
  Play,
  Trophy,
  Heart,
} from "lucide-react";

const questions = [
  {
    id: 1,
    province: "Pichincha",
    question: "¿Dónde está Quito, la capital de Ecuador?",
    hint: "Es la provincia de la Mitad del Mundo.",
  },
  {
    id: 2,
    province: "Guayas",
    question: "¿Dónde está Guayaquil y su Malecón junto al río?",
    hint: "Es la provincia más poblada.",
  },
  {
    id: 3,
    province: "Azuay",
    question: "¿Dónde está Cuenca, la ciudad con casas de colores y ríos azules?",
    hint: "Su capital comparte nombre con la provincia.",
  },
  {
    id: 4,
    province: "Manabí",
    question: "¿Dónde está la playa de Canoa para surfear?",
    hint: "Es una provincia de la costa central.",
  },
  {
    id: 5,
    province: "Galápagos",
    question: "¿Dónde viven tortugas gigantes en islas del océano?",
    hint: "Es un parque nacional y reserva de la biosfera.",
  },
  {
    id: 6,
    province: "Tungurahua",
    question: "¿Dónde está Baños con aguas termales y tirolesas?",
    hint: "Su capital es Ambato.",
  },
];

function App() {
  const [gameState, setGameState] = useState("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const socketRef = useRef(null);

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
  }, [gameState, currentQuestion, lives]);

  const handleAnswerBasedOnButton = (button) => {
    if (gameState !== "playing") return;

    const correctProvinceIndex = currentQuestion + 1;

    if (parseInt(button, 10) === correctProvinceIndex) {
      processAnswer(true);
    } else {
      processAnswer(false);
    }
  };

  const processAnswer = (isCorrect) => {
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
  };

  const startGame = () => {
    setGameState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
  };

  // UI Components

  const StartScreen = () => (
    <div className="bg-start flex-center">
      <div className="card card-large text-center">
        <div>
          <MapPin
            className="icon-large icon-bounce"
            style={{ margin: "0 auto 20px", color: "#2196F3" }}
          />
          <h1 className="title-main">¡Descubre Ecuador!</h1>
          <p className="subtitle">Juego de Provincias</p>
        </div>
        <div>
          <div className="star-decoration">
            <Star className="star" />
            <span className="instruction-title">Para niños aventureros</span>
            <Star className="star" />
          </div>
          <p className="instruction-text" style={{ marginBottom: "30px" }}>
            Escucha las preguntas y toca la provincia correcta en el mapa
          </p>
        </div>
        <button onClick={startGame} className="btn btn-primary">
          <Play className="icon" />
          ¡Empezar a Jugar!
        </button>
      </div>
    </div>
  );

  const GameScreen = () => (
    <div className="bg-game">
      <div className="container">
        <div className="game-header flex-between">
          <div className="lives-container">
            <div
              style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2C3E50" }}
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

        <div className="flex-center">
          <div className="card card-game text-center">
            <div>
              <h2 className="question-text">
                {questions[currentQuestion]?.question}
              </h2>
              <div className="hint-box">
                <p className="hint-text">💡 Pista: {questions[currentQuestion]?.hint}</p>
              </div>
            </div>

            <div>
              <div className="map-instruction">
                <MapPin
                  className="icon"
                  style={{ width: "48px", height: "48px", color: "#9C27B0", margin: "0 auto 15px" }}
                />
                <p className="instruction-title">Busca la provincia en el mapa</p>
                <p className="instruction-text">Toca la provincia correcta en tu tablero</p>
              </div>

              {/* Opcional: botones de simulación para pruebas */}
              <div className="simulation-buttons" style={{ marginTop: "20px" }}>
                <button
                  onClick={() => handleAnswerBasedOnButton((currentQuestion + 1).toString())}
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

  const FeedbackScreen = ({ isCorrect }) => (
    <div
      className={isCorrect ? "bg-correct flex-center" : "bg-incorrect flex-center"}
    >
      <div className="card card-large feedback-card text-center">
        <div>
          <div className="emoji">{isCorrect ? "🎉" : "😢"}</div>
          <h2 className={`feedback-title ${isCorrect ? "success" : "error"}`}>
            {isCorrect ? "¡Excelente!" : "¡Oops!"}
          </h2>
          <p className="feedback-text">
            {isCorrect
              ? "¡Encontraste la provincia correcta!"
              : "Inténtalo de nuevo"}
          </p>
        </div>
        <div className="feedback-score">
          {isCorrect ? `¡+1 punto!` : `Te quedan ${lives} vidas`}
        </div>
      </div>
    </div>
  );

  const FinishedScreen = () => (
    <div className="bg-finished flex-center">
      <div className="card card-large text-center">
        <div>
          <Trophy
            className="icon-large"
            style={{ margin: "0 auto 20px", color: "#F1C40F" }}
          />
          <h2 className="title-secondary">
            {score >= 3 ? "¡Felicitaciones!" : "¡Buen intento!"}
          </h2>
          <p className="subtitle">Juego terminado</p>
        </div>
        <div>
          <div className="score-display">
            <p className="final-score">
              Tu puntuación: {score} de {questions.length}
            </p>
          </div>
          <div className="score-message">
            {score >= 4
              ? "¡Eres un experto en geografía!"
              : score >= 2
              ? "¡Muy bien! Sigue practicando"
              : "¡No te rindas! Inténtalo otra vez"}
          </div>
        </div>
        <button onClick={startGame} className="btn btn-restart">
          <RotateCcw className="icon" />
          Jugar de Nuevo
        </button>
      </div>
    </div>
  );

  return (
    <>
      {gameState === "start" && <StartScreen />}
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
