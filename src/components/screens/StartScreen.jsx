import { GameContext } from "../../context/gameContext";
import { useContext } from "react";

import { Play, Trophy } from "lucide-react";

export const StartScreen = () => {

    const { setGameState } = useContext(GameContext);

    const goToPlayerInfo = () => {
        setGameState("player-info");
    };

    const goToLeaderboard = () => {
        setGameState("leaderboard");
    };

    return (
        <div className="bg-start flex-center">
            <div className="flex-column align-center">
                <div className="card card-large text-center">
                    <div>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "16px", marginBottom: "16px" }}>
                            <img
                                src="/src/assets/imgs/ayaHuma bn.gif"
                                alt="Ecuador Logo"
                                style={{ height: "100px", marginBottom: "0px", marginTop: "-32px" }}
                            />
                            <img
                                src="/src/assets/imgs/ayaHuma.gif"
                                alt="Ecuador Logo"
                                style={{ height: "200px", marginBottom: "0px", marginTop: "-32px" }}
                            />
                            <img
                                src="/src/assets/imgs/ayaHuma bn.gif"
                                alt="Ecuador Logo"
                                style={{ height: "100px", marginBottom: "0px", marginTop: "-32px" }}
                            />
                        </div>
                        <h1 className="title-main">Ecuador Interactivo</h1>
                        <p className="subtitle">Con un toque educativo</p>
                    </div>
                    <button onClick={goToPlayerInfo} className="btn btn-primary">
                        <Play className="icon" />
                        Jugar
                    </button>
                    <button onClick={goToLeaderboard} className="btn btn-primary" style={{ marginTop: "16px" }}>
                        <Trophy className="icon" />
                        Ver Puntaciones
                    </button>
                </div>

                <div className="card card-instruction text-center">
                    <h2 className="instruction-title">¿Cómo jugar?</h2>
                    <div className="instruction-steps">
                        <div className="step">
                            <img
                                src="/src/assets/imgs/read.png"
                                alt="Leer"
                                className="step-icon"
                            />
                            <p>1. Lee la pregunta</p>
                        </div>
                        <div className="step">
                            <img
                                src="/src/assets/imgs/touchscreen.png"
                                alt="Tocar"
                                className="step-icon"
                            />
                            <p>2. Presiona la respuesta</p>
                        </div>
                        <div className="step">
                            <img
                                src="/src/assets/imgs/medal.png"
                                alt="Ganar"
                                className="step-icon"
                            />
                            <p>3. Gana puntos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}