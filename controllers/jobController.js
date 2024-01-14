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
   if( req.query.plz == null){
    res.status(400).send({ success: false, error: "plz was not provided"});
    return;
   }
    const query = 'SELECT * FROM JobDaten WHERE plz IN (?)';
    

    db.query(query, req.query.plz, (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  function createJob(req, res) {
    const { UserID, Title, Textfeld, Wann, Nachname, Adresse, plz, Tel } = req.body;
  
    const query = 'INSERT INTO JobDaten (UserID, Title, Textfeld, Wann, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  
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
    const { ApplicationID, AcceptedByUserID } = req.body;
  
    const updateQuery = 'UPDATE JobBewerbungen SET Akzeptiert = true WHERE BewerbungID = ?';
    db.query(updateQuery, [ApplicationID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        const updateJobQuery = 'UPDATE JobDaten SET AcceptedByUserID = ? WHERE JobID = ?';
        db.query(updateJobQuery, [AcceptedByUserID, jobID], (err, result) => {
          if (err) {
            res.status(500).send({ success: false, error: err.message });
          } else {
            // Hier könnte man eine Nachricht an den akzeptierten Benutzer schicken
            res.send({ success: true });
          }
        });
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
  