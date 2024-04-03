const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = 'dein_geheimer_schluessel';


function generateToken(userID) {
  return jwt.sign({ userID }, secretKey, { expiresIn: '1h' }); 
}

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
  const { Vorname, Nachname, Adresse, Plz, Tel, Email, Password } = req.body;

  if (Password.length < 8) {
    res.status(400).send({ success: false, error: 'Das Passwort muss mindestens 8 Zeichen lang sein' });
    return;
  }

  let hash =  bcrypt.hashSync(Password, 10);
  
  const query = 'INSERT INTO UserDaten (Vorname, Nachname, Adresse, Plz, Tel, Email, Password) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [Vorname, Nachname, Adresse, Plz, Tel, Email, hash], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, error: 'Internal Server Error' });
    } else {
      res.send({ success: true, userID: result.insertId });
    }
  });
}



function loginUser(req, res) {
  const { Email, Password } = req.body;
  if(Email == '' || Email == null || Password == '' || Password == null)
    res.status(401).send({ success: false, error: 'Mail oder Passwort ist leer.' });

  const query = 'SELECT * FROM UserDaten WHERE Email = ?';

  db.query(query, [Email], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      if (results.length > 0) {
        const user = results[0];
        console.log(Password, user.Password);
        bcrypt.compare(Password, user.Password, (err, result) => {
          if (result) {
            const token = generateToken(user.UserID);
            res.send({ success: true, token });
          } else {
            res.status(401).send({ success: false, error: 'Falsches Passwort' });
            //console.log(Password, user.Password);
          }
        });
      } else {
        res.status(401).send({ success: false, error: 'Benutzer nicht gefunden' });
      }
    }
  });
}

function getUserFromToken(req, res) {
  const userID = req.jwt.userID;

  const query = 'SELECT *, DATEDIFF(CURDATE(), RegistrierDatum) AS Tage_seit_Registrierung FROM UserDaten WHERE UserID = ?';
  db.query(query, [userID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, user: result });
    }
  });
}

function updateUser(req, res) {
  const userID = req.jwt.userID;
  const { Vorname, Nachname, Adresse, Plz, Tel, Email } = req.body;

  const fields = [];
  const values = [];

  // Überprüfen, welche Felder vorhanden sind und sie der Abfrage hinzufügen
  if (Vorname !== undefined) {
    fields.push('Vorname = ?');
    values.push(Vorname);
  }
  if (Nachname !== undefined) {
    fields.push('Nachname = ?');
    values.push(Nachname);
  }
  if (Adresse !== undefined) {
    fields.push('Adresse = ?');
    values.push(Adresse);
  }
  if (Plz !== undefined) {
    fields.push('Plz = ?');
    values.push(Plz);
  }
  if (Tel !== undefined) {
    fields.push('Tel = ?');
    values.push(Tel);
  }
  if (Email !== undefined) {
    fields.push('Email = ?');
    values.push(Email);
  }

  // Wenn keine Felder vorhanden sind, senden wir eine Fehlermeldung
  if (fields.length === 0) {
    res.status(400).send({ success: false, error: 'No fields provided for update' });
    return;
  }

  const query = `UPDATE UserDaten SET ${fields.join(', ')} WHERE UserID = ?`;
  values.push(userID);

  db.query(query, values, (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, result: result });
    }
  });
}

function changePassword(req, res) {
  const userID = req.jwt.userID;
  const { Email, OldPassword, NewPassword } = req.body;

  const query = 'SELECT * FROM UserDaten WHERE UserID = ? AND Email = ?';

  db.query(query, [userID, Email], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      if (results.length > 0) {
        const user = results[0];
        bcrypt.compare(OldPassword, user.Password, (err, result) => {
          if (result) {
            let hash = bcrypt.hashSync(NewPassword, 10);
            const updateQuery = 'UPDATE UserDaten SET Password = ? WHERE UserID = ?';
            db.query(updateQuery, [hash, userID], (err, updateResult) => {
              if (err) {
                res.status(500).send({ success: false, error: err.message });
              } else {
                res.send({ success: true, message: 'Passwort erfolgreich geändert' });
              }
            });
          } else {
            res.status(401).send({ success: false, error: 'Altes Passwort ist falsch' });
          }
        });
      } else {
        res.status(401).send({ success: false, error: 'Benutzer nicht gefunden oder E-Mail-Adresse stimmt nicht überein' });
      }
    }
  });
}


function getUserHasTutorialCompleted(req, res) {
  const userID = req.query.userID;

  const query = 'SELECT hasCompletedTutorial FROM UserDaten WHERE UserID = ?'
  db.query(query, [userID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, result: result });
    }
  });

}

function setUserHasTutorialCompleted(req, res) {
  const userID = req.query.userID;


  const query = 'UPDATE UserDaten SET hasCompletedTutorial = 1 WHERE UserID = ?'
  db.query(query, [userID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, result: result });
    }
  });

}
  
  function userDelete (req, res) {
    const userID = req.jwt.userID;
        // Löschvorgang
        const query = 'DELETE FROM UserDaten WHERE UserID = ?';
        db.query(query, [userID], (err, result) => {
          if (err) {
            res.status(500).send({ success: false, error: err.message });
          } else {
            res.send({ success: true, message: 'User deleted successfully' });
          }
        });
      }
    

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  updateUser,
  changePassword,
  generateToken,
  getUserFromToken,
  getUserHasTutorialCompleted,
  setUserHasTutorialCompleted,
  userDelete
};
