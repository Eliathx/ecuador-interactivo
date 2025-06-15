// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import cors from 'cors';

const app = express();
app.use(cors()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 3001;

const arduinoPort = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  autoOpen: false, 
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

arduinoPort.open((err) => {
  if (err) {
    return console.error('Error abriendo el puerto serial:', err.message);
  }
  console.log('Puerto serial abierto correctamente');
});

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
  });
});

parser.on('data', (data) => {
  const trimmedData = data.trim();
  console.log(`📩 Botón presionado: ${trimmedData}`);
  io.emit('arduino-input', { button: trimmedData });
});

// Manejo de errores del puerto serial
arduinoPort.on('error', (err) => {
  console.error('Error en el puerto serial:', err.message);
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
