// close-serial.js
// Script to temporarily close the serial port for Arduino uploads
import { SerialPort } from 'serialport';
import process from 'process';

const port = new SerialPort({
  path: 'COM5',
  baudRate: 9600,
  autoOpen: false
});

console.log('Cerrando puerto COM5 para permitir upload de Arduino...');

// Try to open and immediately close the port to release it
port.open((err) => {
  if (err) {
    console.log('Puerto ya estaba cerrado o no disponible');
  } else {
    port.close(() => {
      console.log('Puerto COM5 cerrado exitosamente');
    });
  }
  process.exit(0);
});

// Also try to list available ports
SerialPort.list().then(ports => {
  console.log('Puertos disponibles:');
  ports.forEach(port => {
    console.log(`- ${port.path}: ${port.manufacturer || 'Unknown'}`);
  });
});
