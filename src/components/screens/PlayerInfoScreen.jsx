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
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f4f6f8",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "40px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                    width: "100%",
                    maxWidth: "400px",
                }}
            >
                <h2 style={{ marginBottom: "10px", fontSize: "24px", color: "#333" }}>
                    ¡Cuéntanos sobre ti!
                </h2>
                <p style={{ marginBottom: "20px", fontSize: "16px", color: "#666" }}>
                    Antes de comenzar, ingresa tu nombre y edad:
                </p>

                <input
                    type="text"
                    placeholder="Tu nombre"
                    ref={nameInputRef}
                    pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                    required
                    style={{
                        width: "100%",
                        marginBottom: "12px",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                    }}
                />
                <input
                    type="number"
                    placeholder="Tu edad"
                    required
                    min={3}
                    max={18}
                    ref={ageInputRef}
                    style={{
                        width: "100%",
                        marginBottom: "20px",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                    }}
                />
                <button
                    onClick={() => {
                        const name = nameInputRef.current?.value.trim();
                        const age = ageInputRef.current?.value.trim();

                        const ageValue = parseInt(age, 10);

                        const nameIsValid = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(name);
                        const ageIsValid = !isNaN(ageValue) && ageValue >= 3 && ageValue <= 18;

                        if (!name || !age) {
                            alert("Por favor, completa todos los campos.");
                            return;
                        }

                        if (!nameIsValid) {
                            alert("El nombre solo puede contener letras y espacios.");
                            return;
                        }

                        if (!ageIsValid) {
                            alert("La edad debe estar entre 3 y 18 años.");
                            return;
                        }

                        setPlayerName(name);
                        setPlayerAge(age);

                        if (name && age) {
                            startGame();
                        }
                    }}
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "16px",
                        cursor: "pointer",
                        transition: "background 0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
                >
                    CONTINUAR
                </button>
            </div>
        </div>
    );

}