function getAllLoans(req, res) {
    db.query('SELECT * FROM LoanDaten', (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }

  function getLoansByPLZ(req, res) {
    if (!req.query.plz) { // Note: Express handles empty query params
      res.status(400).send({ success: false, error: "plz was not provided" });
      return;
    }
  
    const plzs = Array.isArray(req.query.plz) ? req.query.plz : [req.query.plz];
  
    const placeholders = plzs.map(() => '?').join(','); 
    const query = `SELECT * FROM LoanDaten WHERE plz IN (${placeholders})`;
  
    db.query(query, plzs, (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  function createLoan(req, res) {
    const { UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel } = req.body;
  
    const query = 'INSERT INTO LoanDaten (UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, LoanID: result.insertId });
      }
    });
  }
  
  function applyForLoan(req, res) {
    const { LoanID } = req.params;
    const { UserID, Vorname, Nachname, Tel, Email } = req.body;
  
    // Prüfen, ob der User der Ersteller des Loan ist
    const isLoanCreatorQuery = 'SELECT UserID FROM LoanDaten WHERE LoanID = ?';
    db.query(isLoanCreatorQuery, [LoanID], (err, creatorResult) => {
      if (err) {
        return res.status(500).send({ success: false, error: err.message });
      }
  
      if (creatorResult.length === 0) {
        return res.status(404).send({ success: false, error: "Loan not found" });
      }
  
      const LoanCreatorID = creatorResult[0].UserID;
  
      if (LoanCreatorID === UserID) {
        return res.status(400).send({ success: false, error: "User cannot apply for their own loan" });
      }
  
      // Wenn der User nicht der Ersteller ist, fortfahren mit der Bewerbung
      const query = 'INSERT INTO LoanBewerbungen (LoanID, UserID, Vorname, Nachname, Tel, Email) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [LoanID, UserID, Vorname, Nachname, Tel, Email], (err, result) => {
        if (err) {
          res.status(500).send({ success: false, error: err.message });
        } else {
          res.send({ success: true, applicationID: result.insertId });
        }
      });
    });
  }

  function acceptLoan(req, res) {
    const { ApplicationID, AcceptedByUserID } = req.body;
  
    const updateQuery = 'UPDATE LoanBewerbungen SET Akzeptiert = true WHERE BewerbungID = ?';
    db.query(updateQuery, [ApplicationID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        const updateLoanQuery = 'UPDATE LoanDaten SET AcceptedByUserID = ? WHERE LoanID = ?';
        db.query(updateLoanQuery, [AcceptedByUserID, LoanID], (err, result) => {
          if (err) {
            res.status(500).send({ success: false, error: err.message });
          } else {
            // Hier könnte ich eine message an User schicken
            res.send({ success: true });
          }
        });
      }
    });
  }
  
  function closeAndArchiveLoan(req, res) {
    const { LoanID } = req.params;
    const currentUserId = req.user.id; // Aus Authentifizierung abrufen
  
    // Loandetails für Archiv abrufen, Berechtigungen prüfen
    db.query('SELECT * FROM LoanDaten WHERE LoanID = ? AND UserID = ?', [LoanID, currentUserId], (err, result) => {
      if (err) {
        return res.status(500).send({ success: false, error: "Error fetching loan details: " + err.message });
      }
  
      if (result.length === 0) {
        return res.status(404).send({ success: false, error: "loan not found or access denied" });
      }
  
      const loan = result[0];
  
      // Archivieren (inkl. loanID)
      const archiveQuery = 'INSERT INTO Archive (LoanID, UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)';
      db.query(archiveQuery, [loan.LoanID, loan.UserID, loan.Textfeld, loan.Startzeitpunkt, loan.Endzeitpunkt, loan.Vorname, loan.Nachname, loan.Adresse, loan.plz, loan.Tel], (err, archiveResult) => {
        if (err) {
          return res.status(500).send({ success: false, error: "Error archiving the Loan: " + err.message });
        }
  
        // Löschen des Loans
        db.query('DELETE FROM LoanDaten WHERE LoanID = ?', [LoanID], (err, deleteResult) => {
          if (err) {
            return res.status(500).send({ success: false, error: "Error deleting the Loan: " + err.message });
          }
          res.send({ success: true, message: "Loan successfully archived and deleted" });
        });
      });
    });
  }
  
  function getArchivedLoan(req, res) {
    const currentUserId = req.user.id; 
  
    db.query('SELECT * FROM Archive WHERE UserID = ?', [currentUserId], (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
 
  // Middleware zur Authentifizierung
  const requireAuth = function (req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).send({ success: false, error: 'Access denied -  Authentication Token not provided' });
    }
  
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded; // Dekodiertes User-Objekt anhängen
      next();
    } catch (err) {
      res.status(400).send({ success: false, error: 'Invalid token' });
    }
  };
  
  module.exports = {
    getAllLoans,
  getLoansByPLZ,
  createLoan,
  applyForLoan,
  acceptLoan,
  closeAndArchiveLoan,
  getArchivedLoan,
  requireAuth
  };
  