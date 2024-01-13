const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deine_datenbank',
  port: 3306 // Hier wird der Port 3306 angegeben
});

db.connect((err) => {
  if (err) {
    console.log('Fehler beim Verbinden zur Datenbank:', err);
  } else {
    console.log('Erfolgreich mit der Datenbank verbunden');
  }
});

global.db = db;
