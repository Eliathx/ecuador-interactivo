// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';

// Cargar variables de entorno
dotenv.config();

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

// Configuración del puerto serial desde variables de entorno
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM3'; // Puerto por defecto COM3
const BAUD_RATE = parseInt(process.env.BAUD_RATE) || 9600; // Baud rate por defecto 9600
const RECONNECT_INTERVAL = parseInt(process.env.RECONNECT_INTERVAL) || 5000; // Intervalo de reconexión en ms

console.log(`🔌 Configuración Arduino:`);
console.log(`   Puerto: ${SERIAL_PORT}`);
console.log(`   Baud Rate: ${BAUD_RATE}`);
console.log(`   Reconexión cada: ${RECONNECT_INTERVAL/1000} segundos`);

const arduinoPort = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
  autoOpen: false, 
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Function to open serial port with retry logic
function openSerialPort() {
  arduinoPort.open((err) => {
    if (err) {
      console.error(`❌ Error abriendo el puerto serial ${SERIAL_PORT}:`, err.message);
      console.log('💡 Verifica que:');
      console.log('   - El Arduino esté conectado');
      console.log(`   - El puerto ${SERIAL_PORT} sea correcto`);
      console.log('   - No esté siendo usado por otra aplicación');
      console.log(`🔄 Reintentando en ${RECONNECT_INTERVAL/1000} segundos...`);
      setTimeout(openSerialPort, RECONNECT_INTERVAL);
      return;
    }
    console.log(`✅ Puerto serial ${SERIAL_PORT} abierto correctamente`);
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
  console.log(`📨 Datos recibidos del Arduino: "${trimmedData}"`);
  
  // Buscar el patrón "Botón X presionado" donde X es el número
  const buttonMatch = trimmedData.match(/Botón\s+(\d+)\s+presionado/i);
  
  if (buttonMatch) {
    const buttonNumber = parseInt(buttonMatch[1], 10);
    
    // Validar que sea un número válido entre 0 y 23
    if (!isNaN(buttonNumber) && buttonNumber >= 0 && buttonNumber <= 23) {
      console.log(`🎮 Botón ${buttonNumber} procesado correctamente`);
      io.emit('arduino-input', { button: buttonNumber });
    } else {
      console.warn(`⚠️ Número de botón inválido: ${buttonNumber}`);
    }
  } else {
    console.log(`🔍 Formato de datos no reconocido: "${trimmedData}"`);
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
  console.log(`🔌 Esperando conexión Arduino en puerto: ${SERIAL_PORT}`);
});
