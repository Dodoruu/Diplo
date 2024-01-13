function getAllJobs(req, res) {
    db.query('SELECT * FROM JobDaten', (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  function createJob(req, res) {
    const { UserID, Title, Textfeld, Wann, Nachname, Adresse, plz, Tel } = req.body;
  
    const query = 'INSERT INTO JobDaten (UserID, Textfeld, Wann, Nachname, Adresse, Tel) VALUES (?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Title, Textfeld, Wann, Nachname, Adresse, plz, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, jobID: result.insertId });
      }
    });
  }
  
  function acceptJob(req, res) {
    const { JobID, UserID } = req.body;
  
    const query = 'UPDATE JobDaten SET AcceptedByUserID = ? WHERE JobID = ?';
  
    db.query(query, [UserID, JobID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true });
      }
    });
  }
  
  function getArchivedJobs(req, res) {
    db.query('SELECT * FROM Archive', (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  module.exports = {
    getAllJobs,
    createJob,
    acceptJob,
    getArchivedJobs
  };
  