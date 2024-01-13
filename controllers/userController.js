const bcrypt = require('bcrypt');



const jwt = require('jsonwebtoken');
const secretKey = 'dein_geheimer_schluessel';

function generateToken(userID) {
  return jwt.sign({ userID }, secretKey, { expiresIn: '1h' }); // Das Token ist 1 Stunde gültig
}

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  updateUser,
  generateToken // Füge diese Zeile hinzu, um die Funktion zu exportieren
};




function getAllUsers(req, res) {
  db.query('SELECT * FROM UserDaten', (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function registerUser(req, res) {
  const { Vorname, Nachname, adresse, plz, Tel, email, password } = req.body;

  console.log(password);
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      const query = 'INSERT INTO UserDaten (Vorname, Nachname, adresse, Tel, email, password) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [Vorname, Nachname, adresse, plz, Tel, email, hash], (err, result) => {
        if (err) {
          res.status(500).send({ success: false, error: err.message });
        } else {
          res.send({ success: true, userID: result.insertId });
        }
      });
    }
  });
} 

function loginUser(req, res) {
  const { email, password } = req.body;

  const query = 'SELECT * FROM UserDaten WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      if (results.length > 0) {
        const user = results[0];
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) {
            const token = generateToken(user.UserID);
            res.send({ success: true, token });
          } else {
            res.status(401).send({ success: false, error: 'Falsches Passwort' });
          }
        });
      } else {
        res.status(401).send({ success: false, error: 'Benutzer nicht gefunden' });
      }
    }
  });
}

function updateUser(req, res) {
  const userID = req.params.userID;
  const { Vorname, Nachname, adresse, plz, Tel, email } = req.body;

  const query = 'UPDATE UserDaten SET Vorname = ?, Nachname = ?, adresse = ?, Tel = ?, email = ? WHERE UserID = ?';

  db.query(query, [Vorname, Nachname, adresse, plz, Tel, email, userID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true });
    }
  });
}

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  updateUser
};
