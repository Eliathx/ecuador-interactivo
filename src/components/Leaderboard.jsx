import { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/gameContext";
import { MoveLeft, Trophy, Users, Award } from "lucide-react";
import "./Leaderboard.css";

export const Leaderboard = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setGameState } = useContext(GameContext);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch("http://localhost:3002/api/leaderboard");
                
                if (!response.ok) {
                    throw new Error('Error al cargar el leaderboard');
                }
                
                const data = await response.json();
                setDatos(data || []);
            } catch (err) {
                console.error("Error al obtener datos:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // const getRankClass = (index) => {
    //     const rank = index + 1;
    //     if (rank <= 3) {
    //         return `rank-cell top-3 rank-${rank} black`;
    //     }
    //     return "rank-cell";
    // };

    const formatScore = (score) => {
        return new Intl.NumberFormat('es-ES').format(score);
    };

    return (
        <div className="bg-leaderboard">
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <button 
                        className="back-button"
                        onClick={() => setGameState("start")}
                        aria-label="Volver al inicio"
                    >
                        <MoveLeft className="icon" />
                    </button>
                    
                    <h1 className="leaderboard-title">
                        <Trophy style={{ marginRight: '15px', verticalAlign: 'middle' }} />
                        Tabla de Puntuaciones
                    </h1>
                    
                    <div style={{ width: '48px' }}></div> {/* Spacer for centering */}
                </div>

                <div className="leaderboard-card">
                    {loading ? (
                        <div className="leaderboard-loading">
                            <div className="loading-spinner"></div>
                            <span>Cargando puntuaciones...</span>
                        </div>
                    ) : error ? (
                        <div className="empty-leaderboard">
                            <div className="empty-leaderboard-icon">⚠️</div>
                            <div className="empty-leaderboard-text">Error al cargar</div>
                            <div className="empty-leaderboard-subtext">{error}</div>
                        </div>
                    ) : datos.length === 0 ? (
                        <div className="empty-leaderboard">
                            <div className="empty-leaderboard-icon">
                                <Users size={64} />
                            </div>
                            <div className="empty-leaderboard-text">¡Sé el primero!</div>
                            <div className="empty-leaderboard-subtext">
                                Aún no hay puntuaciones registradas. ¡Juega y establece el primer récord!
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ 
                                textAlign: 'center', 
                                marginBottom: '30px',
                                color: '#666',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}>
                                <Award size={20} />
                                <span>Mejores {datos.length} jugadores</span>
                            </div>
                            
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        {/* <th>Posición</th> */}
                                        <th>Jugador</th>
                                        <th>Edad</th>
                                        <th>Puntuación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datos.map((item, index) => (
                                        <tr key={`${item.name}-${index}`}>
                                            {/* <td className={getRankClass(index)} style={{color:"black !important"}}>
                                                {index + 1}
                                            </td> */}
                                            <td className="name-cell">{item.name}</td>
                                            <td className="age-cell">{item.age} años</td>
                                            <td className="score-cell">
                                                {formatScore(item.score)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

};
