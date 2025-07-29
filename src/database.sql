CREATE DATABASE IF NOT EXISTS ecuador_interactivo;
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    score INT NOT NULL
);

-- Insertar datos de ejemplo
INSERT INTO leaderboard (name, age, score) VALUES
    ('Juan Pérez', 25, 850),
    ('María González', 19, 920),
    ('Carlos Andrade', 22, 760),
    ('Ana Martínez', 27, 1050),
    ('Luis Rodríguez', 20, 680)
ON CONFLICT DO NOTHING;