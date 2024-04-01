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

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Verbinde Routen
app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/event', eventRoutes);
app.use('/loan', loanRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

module.exports = server;