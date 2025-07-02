// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import cors from 'cors';
import process from 'process';

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
  path: 'COM5',
  baudRate: 9600,
  autoOpen: false, 
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Function to open serial port with retry logic
function openSerialPort() {
  arduinoPort.open((err) => {
    if (err) {
      console.error('Error abriendo el puerto serial:', err.message);
      console.log('Reintentando en 5 segundos...');
      setTimeout(openSerialPort, 5000);
      return;
    }
    console.log('Puerto serial abierto correctamente');
  });
}

// Try to open the serial port
openSerialPort();

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
  });
});

parser.on('data', (data) => {
  const trimmedData = data.trim();
  console.log(`Datos recibidos del Arduino: "${trimmedData}"`);
  
  // Buscar el patrón "Botón X presionado" donde X es el número
  const buttonMatch = trimmedData.match(/Botón\s+(\d+)\s+presionado/i);
  
  if (buttonMatch) {
    const buttonNumber = parseInt(buttonMatch[1], 10);
    
    // Validar que sea un número válido entre 0 y 23
    if (!isNaN(buttonNumber) && buttonNumber >= 0 && buttonNumber <= 23) {
      io.emit('arduino-input', { button: buttonNumber });
    } 
  }
});

// Manejo de errores del puerto serial
arduinoPort.on('error', (err) => {
  console.error('Error en el puerto serial:', err.message);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  if (arduinoPort.isOpen) {
    arduinoPort.close(() => {
      console.log('Puerto serial cerrado');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  if (arduinoPort.isOpen) {
    arduinoPort.close(() => {
      console.log('Puerto serial cerrado');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
