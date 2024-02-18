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
  
    // Prüfen, ob der User der Ersteller des Jobs ist
    const isJobCreatorQuery = 'SELECT UserID FROM JobDaten WHERE JobID = ?';
    db.query(isJobCreatorQuery, [jobID], (err, creatorResult) => {
      if (err) {
        return res.status(500).send({ success: false, error: err.message });
      }
  
      if (creatorResult.length === 0) {
        return res.status(404).send({ success: false, error: "Job not found" });
      }
  
      const jobCreatorID = creatorResult[0].UserID;
  
      if (jobCreatorID === UserID) {
        return res.status(400).send({ success: false, error: "User cannot apply for their own job" });
      }
  
      // Wenn der User nicht der Ersteller ist, fortfahren mit der Bewerbung
      const query = 'INSERT INTO JobBewerbungen (JobID, UserID, Vorname, Nachname, Tel, Email) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [jobID, UserID, Vorname, Nachname, Tel, Email], (err, result) => {
        if (err) {
          res.status(500).send({ success: false, error: err.message });
        } else {
          res.send({ success: true, applicationID: result.insertId });
        }
      });
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
    const { jobID } = req.params;
    const currentUserId = req.user.id; // Aus Authentifizierung abrufen
  
    // Jobdetails für Archiv abrufen, Berechtigungen prüfen
    db.query('SELECT * FROM JobDaten WHERE JobID = ? AND UserID = ?', [jobID, currentUserId], (err, result) => {
      if (err) {
        return res.status(500).send({ success: false, error: "Error fetching job details: " + err.message });
      }
  
      if (result.length === 0) {
        return res.status(404).send({ success: false, error: "Job not found or access denied" });
      }
  
      const job = result[0];
  
      // Archivieren (inkl. JobID)
      const archiveQuery = 'INSERT INTO Archive (JobID, UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)';
      db.query(archiveQuery, [job.JobID, job.UserID, job.Textfeld, job.Startzeitpunkt, job.Endzeitpunkt, job.Vorname, job.Nachname, job.Adresse, job.plz, job.Tel], (err, archiveResult) => {
        if (err) {
          return res.status(500).send({ success: false, error: "Error archiving the job: " + err.message });
        }
  
        // Löschen des Jobs
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
    getAllJobs,
    getJobsByPLZ,
    createJob,
    applyForJob,
    acceptJob,
    getArchivedJobs,
    closeAndArchiveJob, 
    requireAuth
  };
  