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

    // Add missing refs and functions
    const processAnswerRef = useRef(null);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // Placeholder functions - these should be implemented based on your app's needs
    const startResponseTimer = () => {
        // Implementation needed
        console.log("startResponseTimer called");
    };

    const updateDifficultyWithML = () => {
        // Implementation needed
        console.log("updateDifficultyWithML called");
    };

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
                processAnswerRef,
                selectedQuestions,
                setSelectedQuestions,
                startResponseTimer,
                updateDifficultyWithML,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
