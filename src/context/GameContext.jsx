import { createContext, useState, useRef } from "react";

export const GameContext = createContext();

export const GameProvider = ({ children, timePerQuestion }) => {
    const [timeLeft, setTimeLeft] = useState(timePerQuestion);
    const [gameState, setGameState] = useState("start");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const socketRef = useRef(null);

    const [playerName, setPlayerName] = useState("");
    const [playerAge, setPlayerAge] = useState("");

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
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
