function getAllJobs(req, res) {
    db.query('SELECT * FROM JobDaten', (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }

  function getJobsByPLZ(req, res) {
    const { PLZ1, PLZ2 } = req.body;
    const query = 'SELECT * FROM JobDaten WHERE PLZ IN (?, ?)';
    db.query(query, [PLZ1, PLZ2], (err, results) => {
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

  function applyForJob(req, res) {
    const { jobID } = req.params; 
    const { UserID, Vorname, Nachname, Tel, Email } = req.body;
  
    
    const query = 'INSERT INTO JobBewerbungen (JobID, UserID, Vorname, Nachname, Tel, Email) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [jobID, UserID, Vorname, Nachname, Tel, Email], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, applicationID: result.insertId });
      }
    });
  }


  function acceptJob(req, res) {
    const { ApplicationID } = req.body;
  
    // Annahme: Füge Code hinzu, um die ausgewählte Bewerbung als akzeptiert zu markieren
    const updateQuery = 'UPDATE JobBewerbungen SET Akzeptiert = true WHERE BewerbungID = ?';
    db.query(updateQuery, [ApplicationID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        // Hier könnte man eine nachricht an user schicken
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
    getJobsByPLZ,
    createJob,
    applyForJob,
    acceptJob,
    getArchivedJobs
  };
  