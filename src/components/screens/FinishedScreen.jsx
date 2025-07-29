import { useContext } from 'react';
import { GameContext } from '../../context/gameContext';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { questions } from '../../data/questions';
import { useEffect, useRef } from 'react';

const UMBRAL_BUENO = 70;
const UMBRAL_MEDIO = 50;

export const FinishedScreen = () => {

    const { score, playerAge, playerName, currentQuestion, setCurrentQuestion, setGameState, setLives, setScore, lives } = useContext(GameContext);
    const effectRan = useRef(false);
    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        console.log("Guardando en leaderboard:", playerName, playerAge, score);
        if (!playerName || !playerAge) return;

        fetch("http://localhost:3002/api/leaderboard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: playerName,
                age: playerAge,
                score: score,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Error al guardar en leaderboard");
                return res.json();
            })
            .then((data) => console.log("Guardado en leaderboard:", data))
            .catch((err) => console.error(err));
    }, []);

    const startGame = () => {
        setGameState("playing");
        setCurrentQuestion(0);
        setScore(0);
        setLives(3);
    };

    const backToMenu = () => {
        setGameState("start");
    };

    return (
        <div className="bg-finished flex-center">
            <div className="card card-large text-center">
                <div>
                    <div className="emoji">🏁</div>
                    <h2 className="title-secondary"
                        style={
                            {
                                color: score >= UMBRAL_BUENO ? "#4CAF50" :
                                    score >= UMBRAL_MEDIO ? "#E0B800" : "#F76F6F",
                            }
                        }>
                        {score >= UMBRAL_BUENO ? "¡Felicitaciones!" :
                            score >= UMBRAL_MEDIO ? "¡Buen trabajo!" :
                            "¡Buen intento!"}
                        {/* {score >= (questions.length * 10 * 0.5).toFixed(0) ? "¡Felicitaciones!" : "¡Buen intento!"} */}
                    </h2>
                    <p className="subtitle">Juego terminado</p>
                    {/* {lives == 0 && (
                        <div className="score-message">
                             <p>La respuesta correcta era <strong>{questions[currentQuestion]?.province}</strong></p>
                        </div>
                    )} */}
                </div>
                <div>
                    <div className="score-display"
                        style={
                            {
                                background: score >= UMBRAL_BUENO ? "#4CAF50" :
                                    score >= UMBRAL_MEDIO ? "#E0B800" : "#F76F6F",
                            }
                        }>
                        <p className="final-score">
                            Tu puntuación total es {score.toFixed(1)} puntos
                        </p>
                    </div>
                    <div className="score-message">
                        {score >= UMBRAL_BUENO
                            ? "🏆 ¡Increíble! Eres un experto en geografía ecuatoriana"
                            : score >= UMBRAL_MEDIO
                                ? "🥉 ¡Muy bien! Tienes buen conocimiento del Ecuador"
                                : "💪 ¡No te rindas! Con práctica mejorarás mucho"}
                    </div>
                </div>
                <div className="simulation-buttons" style={{ marginTop: "20px" }}>
                    <button onClick={backToMenu} className="btn btn-danger">
                        <ArrowLeft className="icon" />
                        VOLVER AL INICIO
                    </button>
                    <button onClick={startGame} className="btn btn-restart">
                        <RotateCcw className="icon" />
                        JUGAR DE NUEVO
                    </button>
                </div>
            </div>
        </div>
    );
}