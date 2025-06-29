import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});


app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, age, score FROM leaderboard ORDER BY score DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener leaderboard');
    }
});

app.post('/api/leaderboard', async (req, res) => {
    const { name, age, score } = req.body;

    const ageNum = Number(age);
    const scoreNum = Number(score);

    if (!name || isNaN(ageNum) || isNaN(scoreNum)) {
        return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
        await pool.query(
            'INSERT INTO leaderboard (name, age, score) VALUES ($1, $2, $3)',
            [name, ageNum, scoreNum]
        );
        res.status(201).json({ message: 'Puntaje guardado correctamente' });
    } catch (err) {
        console.error("Error al insertar en leaderboard:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.listen(port, () => {
    console.log(`Servidor backend en http://localhost:${port}`);
});
