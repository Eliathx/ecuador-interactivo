import { useRef, useContext } from "react";
import { GameContext } from "../../context/gameContext";

export const PlayerInfoScreen = () => {

    const { setGameState, setScore, setLives, setCurrentQuestion, setPlayerName, setPlayerAge } = useContext(GameContext);

    const startGame = () => {
        setGameState("playing");
        setCurrentQuestion(0);
        setScore(0);
        setLives(3);
    };

    const nameInputRef = useRef(null);
    const ageInputRef = useRef(null);

    return (
        <div className="bg-start flex-center">
            <div className="card card-large text-center">
                <h2 className="title-main">¡Cuéntanos sobre ti!</h2>
                <p className="subtitle">Antes de comenzar, ingresa tu nombre y edad:</p>
                <input
                    type="text"
                    className="input"
                    placeholder="Tu nombre"
                    ref={nameInputRef}
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <input
                    type="number"
                    className="input"
                    placeholder="Tu edad"
                    ref={ageInputRef}
                    style={{ marginBottom: "20px", padding: "8px" }}
                />
                <button
                    className="btn btn-success"
                    onClick={() => {
                        const name = nameInputRef.current?.value.trim();
                        const age = ageInputRef.current?.value.trim();

                        setPlayerName(name);
                        setPlayerAge(age);

                        if (name && age) {
                            startGame();
                        }
                    }}
                >
                    CONTINUAR
                </button>

            </div>
        </div>
    );
}