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
    const { PLZ1, PLZ2 } = req.body;
    const query = 'SELECT * FROM LoanDaten WHERE PLZ IN (?, ?)';
    db.query(query, [PLZ1, PLZ2], (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  function createLoan(req, res) {
    const { UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Nachname, Adresse, plz, Tel } = req.body;
  
    const query = 'INSERT INTO LoanDaten (UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Nachname, Adresse, Tel) VALUES (?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Nachname, Adresse, plz, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, LoanID: result.insertId });
      }
    });
  }
  
  function acceptLoan(req, res) {
    const { LoanID, UserID } = req.body;
  
    const query = 'UPDATE LoanDaten SET AcceptedByUserID = ? WHERE JobID = ?';
  
    db.query(query, [UserID, LoanID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true });
      }
    });
  }
  
  function getArchivedLoan(req, res) {
    db.query('SELECT * FROM Archive', (err, results) => {
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
    getArchivedLoan
  };
  