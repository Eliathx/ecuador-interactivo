import { useContext } from 'react';
import { GameContext } from '../../context/gameContext';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { questions } from '../../data/questions';

export const FinishedScreen = () => {

    const { score, currentQuestion, setCurrentQuestion, setGameState, setLives, setScore, lives } = useContext(GameContext);

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
                                color: score >= (questions.length * 0.8).toFixed(0) ? "#4CAF50" :
                                    score >= (questions.length * 0.5).toFixed(0) ? "#E0B800" : "#F76F6F",
                            }
                        }>
                        {score >= (questions.length * 0.5).toFixed(0) ? "¡Felicitaciones!" : "¡Buen intento!"}
                    </h2>
                    <p className="subtitle">Juego terminado</p>
                    {lives == 0 && (
                        <div className="score-message">
                            <p>La respuesta correcta era <strong>{questions[currentQuestion]?.province}</strong></p>
                        </div>
                    )}
                </div>
                <div>
                    <div className="score-display"
                        style={
                            {
                                background: score >= (questions.length * 0.8).toFixed(0) ? "#4CAF50" :
                                    score >= (questions.length * 0.5).toFixed(0) ? "#E0B800" : "#F76F6F",
                            }
                        }>
                        <p className="final-score">
                            Tu puntuación es {score} de {questions.length}
                        </p>
                    </div>
                    <div className="score-message">
                        {score >= (questions.length * 0.8).toFixed(0)
                            ? "¡Increible! Eres un experto"
                            : score >= (questions.length * 0.5).toFixed(0)
                                ? "¡Muy bien! Sigue practicando"
                                : "¡No te rindas! Inténtalo otra vez"}
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