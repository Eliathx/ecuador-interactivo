import { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/gameContext";

import { MoveLeft } from "lucide-react";

export const Leaderboard = () => {
    const [datos, setDatos] = useState([]);
    const { setGameState } = useContext(GameContext);
    useEffect(() => {
        fetch("http://localhost:3002/api/leaderboard")
            .then((res) => res.json())
            .then((data) => setDatos(data))
            .catch((err) => console.error("Error al obtener datos:", err));
    }, []);

    return (
        <div>
            <button onClick={() => {
                setGameState("start");
            }}>
                <MoveLeft className="icon" />
            </button>
            <div className="bg-leaderboard flex-center">
                <div className="card card-large text-center">
                    <h2 className="leaderboard-title">Puntaciones</h2>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Edad</th>
                                <th>Puntuación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.age}</td>
                                    <td>{item.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

};
