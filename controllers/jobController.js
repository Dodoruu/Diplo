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
    if (!req.query.plz) { // Note: Express handles empty query params
      res.status(400).send({ success: false, error: "plz was not provided" });
      return;
    }
  
    const plzs = Array.isArray(req.query.plz) ? req.query.plz : [req.query.plz];
  
    const placeholders = plzs.map(() => '?').join(','); 
    const query = `SELECT * FROM JobDaten WHERE plz IN (${placeholders})`;
  
    db.query(query, plzs, (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  function createJob(req, res) {
    const { UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel, } = req.body;

    const query = 'INSERT INTO JobDaten (UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel], (err, result) => {
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
            // Hier könnte ich eine message an User schicken
            res.send({ success: true });
          }
        });
      }
    });
  }
  
  function closeAndArchiveJob(req, res) {
    const { jobID } = req.params; // JobID aus der URL extrahieren
  
    // Zuerst die Daten des Jobs abrufen, die archiviert werden sollen
    db.query('SELECT * FROM JobDaten WHERE JobID = ?', [jobID], (err, result) => {
      if (err) {
        return res.status(500).send({ success: false, error: "Error fetching job details: " + err.message });
      }
  
      if (result.length === 0) {
        return res.status(404).send({ success: false, error: "Job not found" });
      } 
  
      const job = result[0];
  
      // Job-Daten in die Archiv-Tabelle einfügen
      const archiveQuery = 'INSERT INTO Archive (JobID, UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)';
      db.query(archiveQuery, [job.JobID, job.UserID, job.Textfeld, job.Startzeitpunkt, job.Endzeitpunkt, job.Nachname, job.Adresse, job.plz, job.Tel], (err, archiveResult) => {
        if (err) {
          return res.status(500).send({ success: false, error: "Error archiving the job: " + err.message });
        } 
  
        // Job aus der JobDaten-Tabelle löschen
        db.query('DELETE FROM JobDaten WHERE JobID = ?', [jobID], (err, deleteResult) => {
          if (err) {
            return res.status(500).send({ success: false, error: "Error deleting the job: " + err.message });
          } 
  
          res.send({ success: true, message: "Job successfully archived and deleted" });
        });
      });
    });
  }

  function getArchivedJobs(req, res) {
    db.query('SELECT * FROM Archive WHERE JobID IS NOT NULL', (err, results) => {
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
    getArchivedJobs,
    closeAndArchiveJob 
  };
  