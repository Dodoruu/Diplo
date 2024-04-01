const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'deine_datenbank',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.log('Fehler beim Verbinden zur Datenbank:', err);
  } else {
    console.log('Erfolgreich mit der Datenbank verbunden');
  }
});

module.exports = connection;