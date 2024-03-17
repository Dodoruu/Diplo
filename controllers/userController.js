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
  const { Vorname, Nachname, adresse, plz, Tel, email, password } = req.body;

  let hash =  bcrypt.hashSync(password, 10);
  
  const query = 'INSERT INTO UserDaten (Vorname, Nachname, adresse, plz, Tel, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [Vorname, Nachname, adresse, plz, Tel, email, hash], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, error: 'Internal Server Error' });
    } else {
      res.send({ success: true, userID: result.insertId });
    }
  });
}



function loginUser(req, res) {
  const { email, password } = req.body;
  if(email == '' || email == null || password == '' || password == null)
    res.status(401).send({ success: false, error: 'Mail oder Passwort ist leer.' });

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
            
            //store the token into the database
            const storeTokenQuery = 'UPDATE UserDaten SET cookie = ? WHERE UserID = ?';
            db.query(storeTokenQuery, [token, user.UserID], (err, updateResults) => {
              if (err) {
                res.status(500).send({ success: false, error: err.message });
              } else {
                res.send({ success: true, token });
              }
            });
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

function getUserFromToken(req, res) {
  const {token} = req.body;

  const query = 'SELECT * FROM UserDaten WHERE cookie = ?'
  db.query(query, [token], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, user: result });
    }
  });

}

function updateUser(req, res) {
  const userID = req.params.userID;
  const { Vorname, Nachname, adresse, plz, Tel, email } = req.body;

  const query = 'UPDATE UserDaten SET Vorname = ?, Nachname = ?, adresse = ?, plz = ?, Tel = ?, email = ? WHERE UserID = ?';
  
  db.query(query, [Vorname, Nachname, adresse, plz, Tel, email, userID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, result: result });
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
    const currentUserId = req.params.userID; // UserID to be deleted
  
    // Middleware-basierte Authentifizierung
    authenticate(req, res, next => {
      if (next) {
        // Nur fortfahren, wenn der Benutzer authentifiziert ist
        if (decoded.userID !== parseInt(currentUserId)) {
          return res.status(403).send({ success: false, error: 'Forbidden. You can only delete your own account.' });
        }
  
        // Löschvorgang
        const query = 'DELETE FROM UserDaten WHERE UserID = ?';
        db.query(query, [currentUserId], (err, result) => {
          if (err) {
            res.status(500).send({ success: false, error: err.message });
          } else {
            res.send({ success: true, message: 'User deleted successfully' });
          }
        });
      }
    });
  }

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  updateUser,
  generateToken,
  getUserFromToken,
  getUserHasTutorialCompleted,
  setUserHasTutorialCompleted,
  userDelete
};
