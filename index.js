const express = require('express');
const app = express();
const db = require('./db');
const bcrypt = require('bcrypt');
const userRoutes = require('./Routes/userRoutes');
const jobRoutes = require('./Routes/jobRoutes');
const eventRoutes = require('./Routes/eventRoutes');
const loanRoutes = require('./Routes/loanRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const portfinder = require('portfinder');

// Konfiguriere den Portbereich und die maximale Anzahl von Versuchen
portfinder.basePort = 3000;
portfinder.highestPort = 4000;
portfinder.maxRetries = 10;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Verbinde Routen
app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/event', eventRoutes);
app.use('/loan', loanRoutes);

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server läuft auf Port ${port}`);
      resolve({ server, port });
    });
    server.on('error', (err) => {
      reject(err);
    });
  });
};

const closeServer = (server) => {
  return new Promise((resolve, reject) => {
    server.close(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


module.exports = { startServer, closeServer };