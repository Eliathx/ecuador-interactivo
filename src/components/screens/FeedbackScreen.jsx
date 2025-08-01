import { useContext } from 'react';
import { GameContext } from '../../context/gameContext';

export const FeedbackScreen = ({ isCorrect }) => {

    const { playerName} = useContext(GameContext);

    return (
        <div
            className={
                isCorrect ? "bg-correct flex-center" : "bg-incorrect flex-center"
            }
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
                    {isCorrect ? `¡Sigue así, ${playerName}!` : `¡No te rindas, ${playerName}!`}
                </div>
            </div>
        </div>
    );
}