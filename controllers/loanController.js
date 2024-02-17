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
  
  function acceptLoan(req, res) {
    const { LoanID, UserID } = req.body;
  
    const query = 'UPDATE LoanDaten SET AcceptedByUserID = ? WHERE LoanID = ?';
  
    db.query(query, [UserID, LoanID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true });
      }
    });
  }
  
  function closeAndArchiveLoan(req, res) {
    const { LoanID } = req.params; // Annahme, dass LoanID über URL-Parameter übergeben wird
  
    // Schritt 1: Details des Loans abrufen
    db.query('SELECT * FROM LoanDaten WHERE LoanID = ?', [LoanID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else if (result.length > 0) {
        const loan = result[0];
        // Schritt 2: Loan in das Archiv verschieben
        const archiveQuery = 'INSERT INTO Archive (UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname,  Nachname, Adresse, PLZ, Tel) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)';
        db.query(archiveQuery, [loan.UserID, loan.Textfeld, loan.Startzeitpunkt, loan.Endzeitpunkt, loan.Vorname, loan.Nachname, loan.Adresse, loan.PLZ, loan.Tel], (archiveErr, archiveResult) => {
          if (archiveErr) {
            res.status(500).send({ success: false, error: archiveErr.message });
          } else {
            // Schritt 3: Originalen Loan löschen (optional, je nach Anforderung)
            db.query('DELETE FROM LoanDaten WHERE LoanID = ?', [LoanID], (deleteErr, deleteResult) => {
              if (deleteErr) {
                res.status(500).send({ success: false, error: deleteErr.message });
              } else {
                res.send({ success: true, message: 'Loan erfolgreich archiviert und aus den aktiven Daten entfernt.' });
              }
            });
          }
        });
      } else {
        res.status(404).send({ success: false, error: 'Loan nicht gefunden.' });
      }
    });
  }
  
  function getArchivedLoan(req, res) {
    db.query('SELECT * FROM Archive WHERE LoanID IS NOT NULL', (err, results) => {
        if (err) {
            res.status(500).send({ success: false, error: err.message });
        } else {
            res.send({ success: true, data: results });
        }
    });
}
  
  module.exports = {
    getAllLoans,
  getLoansByPLZ,
  createLoan,
  acceptLoan,
  closeAndArchiveLoan,
  getArchivedLoan
  };
  