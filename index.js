const express = require('express');
const app = express();
const db = require('./db'); // Verbinde dich zur Datenbank
const bcrypt = require('bcrypt');
const userRoutes = require('./Routes/userRoutes'); // Anpassung hier
const jobRoutes = require('./Routes/jobRoutes');
const eventRoutes = require('./Routes/eventRoutes'); // Anpassung hier
const loanRoutes = require('./Routes/loanRoutes');
const cors=require('cors');
app.use(cors());

app.use(express.json());

// Verbinde Routen
app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/event', eventRoutes);
app.use('/loan', loanRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
