function getAllLoans(req, res) {
    db.query('SELECT * FROM LoanDaten', (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  function createLoan(req, res) {
    const { UserID, Textfeld, Wann, Nachname, Adresse, Tel } = req.body;
  
    const query = 'INSERT INTO LoanDaten (UserID, Textfeld, Wann, Nachname, Adresse, Tel) VALUES (?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Textfeld, Wann, Nachname, Adresse, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, LoanID: result.insertId });
      }
    });
  }
  
  function acceptLoan(req, res) {
    const { LoanIDID, UserID } = req.body;
  
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
    createLoan,
    acceptLoan,
    getArchivedLoan
  };
  