const jwt = require('jsonwebtoken');
const secretKey = 'dein_geheimer_schluessel';

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
  if (!req.query.Plz) {
    res.status(400).send({ success: false, error: "Plz was not provided" });
    return;
  }

  const Plzs = Array.isArray(req.query.Plz) ? req.query.Plz : [req.query.Plz];

  const placeholders = Plzs.map(() => '?').join(','); 
  const query = `SELECT * FROM JobDaten WHERE Plz IN (${placeholders})`;

  db.query(query, Plzs, (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getMyjob(req, res) { /* gibt informationen über einen Job, die JobID wird in der URL angegeben*/
  if (!req.params.jobID) {
    res.status(400).send({ success: false, error: "JobID was not provided" });
    return;
  }

  const jobID = req.params.jobID;

  const query = 'SELECT * FROM JobDaten WHERE JobID = ?';

  db.query(query, [jobID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ success: false, error: "Job not found" });
    } else {
      res.send({ success: true, data: results[0] });
    }
  });
}

function getjob(req, res) { /* gibt informationen über einen Job, die JobID wird in der URL angegeben*/
if (!req.params.jobID) {
  res.status(400).send({ success: false, error: "JobID was not provided" });
  return;
}

const jobID = req.params.jobID;

const query = 'SELECT * FROM JobDaten WHERE JobID = ?';

db.query(query, [jobID], (err, results) => {
  if (err) {
    res.status(500).send({ success: false, error: err.message });
  } else if (results.length === 0) {
    res.status(404).send({ success: false, error: "Job not found" });
  } else {
    res.send({ success: true, data: results[0] });
  }
});
}

function getAllmyjob(req, res) { /* gibt informationen über alle jobs die aktiv erstellt sind von mir habe */
  const userID = req.jwt.userID;

  const query = 'SELECT * FROM JobDaten WHERE UserID = ?';

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function createJob(req, res) {
  const { UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel, } = req.body;

  const query = 'INSERT INTO JobDaten (UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel], (err, result) => {
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

    // Überprüfen, ob der Benutzer sich bereits für diesen Job beworben hat
    const checkApplicationQuery = 'SELECT COUNT(*) AS count FROM JobBewerbungen WHERE JobID = ? AND UserID = ?';
    db.query(checkApplicationQuery, [jobID, UserID], (err, applicationResult) => {
      if (err) {
        return res.status(500).send({ success: false, error: err.message });
      }

      if (applicationResult[0].count > 0) {
        return res.status(400).send({ success: false, error: "User has already applied for this job" });
      }

      const query = 'INSERT INTO JobBewerbungen (JobID, UserID, Vorname, Nachname, Tel, Email) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [jobID, UserID, Vorname, Nachname, Tel, Email], (err, result) => {
        if (err) {
          res.status(500).send({ success: false, error: err.message });
        } else {
          res.send({ success: true, applicationID: result.insertId });
        }
      });
    });
  });
}

function deleteJobApply(req, res) {
  const userID = req.jwt.userID;
  const jobID = req.params.jobID;

  const query = `
    DELETE FROM JobBewerbungen
    WHERE UserID = ? AND JobID = ?
  `;

  db.query(query, [userID, jobID], (err, result) => {
    if (err) {
      console.error('Error deleting job applications:', err);
      res.status(500).send({ success: false, error: 'Internal server error' });
    } else {
      if (result.affectedRows === 0) {
        return res.status(404).send({ success: false, error: 'Keine Bewerbungen für diesen Job gefunden' });
      }

      res.send({ success: true, message: `${result.affectedRows} Bewerbung(en) erfolgreich gelöscht` });
    }
  });
}

function getjobapply(req, res) {
  const userID = req.jwt.userID;
  const jobID = req.params.jobID;

  // Überprüfen, ob der angemeldete Benutzer der Ersteller des Jobs ist
  const checkCreatorQuery = 'SELECT COUNT(*) AS count FROM JobDaten WHERE JobID = ? AND UserID = ?';
  db.query(checkCreatorQuery, [jobID, userID], (err, creatorResult) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (creatorResult[0].count === 0) {
      res.status(403).send({ success: false, error: 'Zugriff verweigert. Sie sind nicht der Ersteller dieses Jobs.' });
      return;
    }

    // Alle Bewerber für den angegebenen Job abrufen
    const query = 'SELECT * FROM JobBewerbungen WHERE JobID = ?';
    db.query(query, [jobID], (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
  });
});
}

function getAlljobapply(req, res) {
  const userID = req.jwt.userID;

  // Alle Jobs des angemeldeten Benutzers abrufen
  const getJobsQuery = 'SELECT JobID FROM JobDaten WHERE UserID = ?';
  db.query(getJobsQuery, [userID], (err, jobResults) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (jobResults.length === 0) {
      res.send({ success: true, data: [] });
      return;
    }

    const jobIDs = jobResults.map(job => job.JobID);

    // Alle Bewerber für die Jobs des Benutzers abrufen
    const getApplicantsQuery = `
      SELECT jb.JobID, jb.BewerbungID, jb.UserID, jb.Vorname, jb.Nachname, jb.Tel, jb.Email, jb.Akzeptiert
      FROM JobBewerbungen jb
      WHERE jb.JobID IN (?)
    `;
    db.query(getApplicantsQuery, [jobIDs], (err, applicantResults) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }

      // Die Ergebnisse gruppieren, um alle Bewerber pro Job zu erhalten
      const applicantsByJob = {};
      applicantResults.forEach(applicant => {
        if (!applicantsByJob[applicant.JobID]) {
          applicantsByJob[applicant.JobID] = [];
        }
        applicantsByJob[applicant.JobID].push(applicant);
      });

      res.send({ success: true, data: applicantsByJob });
    });
  });
}

function getAppliedJobs(req, res) {
  const userID = req.jwt.userID;

  // Alle Bewerbungen des angemeldeten Benutzers abrufen
  const getApplicationsQuery = `
    SELECT jb.JobID
    FROM JobBewerbungen jb
    WHERE jb.UserID = ?
  `;
  db.query(getApplicationsQuery, [userID], (err, applicationResults) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (applicationResults.length === 0) {
      res.send({ success: true, data: [] });
      return;
    }

    const jobIDs = applicationResults.map(application => application.JobID);

    // Alle Jobs abrufen, bei denen sich der Benutzer beworben hat
    const getJobsQuery = `
      SELECT jd.JobID, jd.Title, jd.Textfeld, jd.Startzeitpunkt, jd.Endzeitpunkt, jd.Vorname, jd.Nachname, jd.Adresse, jd.Plz, jd.Tel
      FROM JobDaten jd
      WHERE jd.JobID IN (?)
    `;
    db.query(getJobsQuery, [jobIDs], (err, jobResults) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }

      res.send({ success: true, data: jobResults });
    });
  });
}

async function acceptJob(req, res) {
  const userID = req.jwt.userID;
  const jobID = req.params.jobID;
  const { bewerbungID } = req.body;

  if (!bewerbungID) {
    return res.status(400).send({ success: false, error: 'bewerbungID fehlt' });
  }

  const bewerbungIDInt = parseInt(bewerbungID);

  if (!bewerbungIDInt) {
    return res.status(400).send({ success: false, error: 'bewerbungID ist ungültig' });
  }

  const query = `
    SELECT 
      JobDaten.UserID
    FROM 
      JobBewerbungen
      INNER JOIN JobDaten ON JobBewerbungen.JobID = JobDaten.JobID
    WHERE 
      JobBewerbungen.BewerbungID = ? AND JobBewerbungen.JobID = ?
  `;

  db.query(query, [bewerbungIDInt, jobID], (err, results) => {
    if (err) {
      console.error('Error checking job ownership:', err);
      res.status(500).send({ success: false, error: 'Fehler bei der Überprüfung der Job-Eigentümerschaft' });
    } else {
      if (results.length === 0) {
        return res.status(404).send({ success: false, error: 'Bewerbung für diesen Job nicht gefunden' });
      }

      if (results[0].UserID !== userID) {
        return res.status(403).send({ success: false, error: 'Dieser Job gehört nicht dem angemeldeten Benutzer' });
      }

      const updateQuery = 'UPDATE JobBewerbungen SET Akzeptiert = TRUE WHERE BewerbungID = ?';
      db.query(updateQuery, [bewerbungIDInt], (err, _) => {
        if (err) {
          console.error('Error accepting job application:', err);
          res.status(500).send({ success: false, error: 'Fehler beim Akzeptieren der Bewerbung' });
        } else {
          res.status(200).send({ success: true });
        }
      });
    }
  });
}


async function denyJob(req, res) {
  const userID = req.jwt.userID;
  const jobID = req.params.jobID;
  const { bewerbungID } = req.body;

  if (!bewerbungID) {
    return res.status(400).send({ success: false, error: 'bewerbungID fehlt' });
  }

  const bewerbungIDInt = parseInt(bewerbungID);

  if (!bewerbungIDInt) {
    return res.status(400).send({ success: false, error: 'bewerbungID ist ungültig' });
  }

  const query = `
    SELECT 
      JobDaten.UserID
    FROM 
      JobBewerbungen
      INNER JOIN JobDaten ON JobBewerbungen.JobID = JobDaten.JobID
    WHERE 
      JobBewerbungen.BewerbungID = ? AND JobBewerbungen.JobID = ?
  `;

  db.query(query, [bewerbungIDInt, jobID], (err, results) => {
    if (err) {
      console.error('Error checking job ownership:', err);
      res.status(500).send({ success: false, error: 'Fehler bei der Überprüfung der Job-Eigentümerschaft' });
    } else {
      if (results.length === 0) {
        return res.status(404).send({ success: false, error: 'Bewerbung für diesen Job nicht gefunden' });
      }

      if (results[0].UserID !== userID) {
        return res.status(403).send({ success: false, error: 'Dieser Job gehört nicht dem angemeldeten Benutzer' });
      }

      const updateQuery = 'UPDATE JobBewerbungen SET Akzeptiert = FALSE WHERE BewerbungID = ?';
      db.query(updateQuery, [bewerbungIDInt], (err, _) => {
        if (err) {
          console.error('Error accepting job application:', err);
          res.status(500).send({ success: false, error: 'Fehler beim Akzeptieren der Bewerbung' });
        } else {
          res.status(200).send({ success: true });
        }
      });
    }
  });
}

  function getAcceptedApplicants(req, res) {
    const userID = req.jwt.userID;
    const jobID = req.params.jobID;
  
    // Überprüfen, ob der angemeldete Benutzer der Besitzer des Jobs ist
    const checkOwnerQuery = `
      SELECT COUNT(*) AS count
      FROM JobDaten
      WHERE JobID = ? AND UserID = ?
    `;
    db.query(checkOwnerQuery, [jobID, userID], (err, ownerResult) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }
  
      if (ownerResult[0].count === 0) {
        res.status(403).send({ success: false, error: 'Zugriff verweigert. Sie sind nicht der Besitzer dieses Jobs.' });
        return;
      }
  
      // Alle akzeptierten Bewerber für den angegebenen Job abrufen
      const getAcceptedApplicantsQuery = `
        SELECT jb.BewerbungID, jb.UserID, jb.Vorname, jb.Nachname, jb.Tel, jb.Email
        FROM JobBewerbungen jb
        WHERE jb.JobID = ? AND jb.Akzeptiert = true
      `;
      db.query(getAcceptedApplicantsQuery, [jobID], (err, applicantResults) => {
        if (err) {
          res.status(500).send({ success: false, error: err.message });
          return;
        }
  
        res.send({ success: true, data: applicantResults });
      });
    });
  }

function updateJob(req, res) {
  const userID = req.jwt.userID;
  const jobID = req.params.jobID;
  const { Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel } = req.body;

  const fields = [];
  const values = [];

  if (Title !== undefined) {
    fields.push('Title = ?');
    values.push(Title);
  }
  if (Textfeld !== undefined) {
    fields.push('Textfeld = ?');
    values.push(Textfeld);
  }
  if (Startzeitpunkt !== undefined) {
    fields.push('Startzeitpunkt = ?');
    values.push(Startzeitpunkt);
  }
  if (Endzeitpunkt !== undefined) {
    fields.push('Endzeitpunkt = ?');
    values.push(Endzeitpunkt);
  }
  if (Vorname !== undefined) {
    fields.push('Vorname = ?');
    values.push(Vorname);
  }
  if (Nachname !== undefined) {
    fields.push('Nachname = ?');
    values.push(Nachname);
  }
  if (Adresse !== undefined) {
    fields.push('Adresse = ?');
    values.push(Adresse);
  }
  if (Plz !== undefined) {
    fields.push('Plz = ?');
    values.push(Plz);
  }
  if (Tel !== undefined) {
    fields.push('Tel = ?');
    values.push(Tel);
  }

  if (fields.length === 0) {
    res.status(400).send({ success: false, error: 'No fields provided for update' });
    return;
  }

  const query = `UPDATE JobDaten SET ${fields.join(', ')} WHERE JobID = ? AND UserID = ?`;
  values.push(jobID, userID);

  db.query(query, values, (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).send({ success: false, error: 'Job not found or not authorized' });
    } else {
      res.send({ success: true, result: result });
    }
  });
}

function deleteJob(req, res) {
  const userID = req.jwt.userID;
  const jobID = req.params.jobID;
  

  const query = 'DELETE FROM JobDaten WHERE JobID = ? AND UserID = ?';
  db.query(query, [jobID, userID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).send({ success: false, error: 'Job not found or not authorized' });
    } else {
      res.send({ success: true, message: 'Job deleted successfully' });
    }
  });
}

function closeAndArchiveJob(req, res) {
  console.log(req.jwt);
  console.log('closeAndArchiveJob called');
  const { jobID } = req.params;
  console.log('req.params.jobID:', jobID);

  db.query('SELECT * FROM JobDaten WHERE JobID = ?', [jobID], (err, result) => {
    console.log('Nach der Abfrage - result:', result);
    if (err) {
      console.log('Error fetching job details:', err);
      return res.status(500).send({ success: false, error: "Error fetching job details: " + err.message });
    }
    if (result.length === 0) {
      console.log('Job not found');
      return res.status(404).send({ success: false, error: "Job not found" });
    }

    const job = result[0];

    // Überprüfen, ob der Job bereits in der Tabelle "archive" vorhanden ist
    db.query('SELECT COUNT(*) AS count FROM JobArchive WHERE JobID = ?', [jobID], (err, countResult) => {
      if (err) {
        console.log('Error checking JobArchive:', err);
        return res.status(500).send({ success: false, error: "Error checking JobArchive: " + err.message });
      }

      const count = countResult[0].count;
      if (count > 0) {
        // Der Job ist bereits in "archive" vorhanden, lösche ihn aus "jobdaten"
        db.query('DELETE FROM JobDaten WHERE JobID = ?', [jobID], (err, deleteResult) => {
          if (err) {
            console.log('Error deleting the job from jobdaten:', err);
            return res.status(500).send({ success: false, error: "Error deleting the job from jobdaten: " + err.message });
          }
          console.log('Job already archived and deleted from jobdaten');
          res.send({ success: true, message: "Job already archived and deleted from jobdaten" });
        });
      } else {
        // Der Job ist noch nicht in "archive" vorhanden, füge ihn mit dem gleichen JobID-Wert hinzu
        const archiveQuery = 'INSERT INTO JobArchive (JobID, UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(archiveQuery, [jobID, job.UserID, job.Textfeld, job.Startzeitpunkt, job.Endzeitpunkt, job.Vorname, job.Nachname, job.Adresse, job.Plz, job.Tel], (err, archiveResult) => {
          if (err) {
            console.log('Error archiving the job:', err);
            return res.status(500).send({ success: false, error: "Error archiving the job: " + err.message });
          }
          console.log('Job successfully archived');

          // Verschiebe die zugehörigen Bewerbungen in die Tabelle "JobBewerbungArchive"
          db.query('SELECT * FROM JobBewerbungen WHERE JobID = ?', [jobID], (err, bewerbungResult) => {
            if (err) {
              console.log('Error fetching job applications:', err);
              return res.status(500).send({ success: false, error: "Error fetching job applications: " + err.message });
            }
          
            const bewerbungen = bewerbungResult;
            const archiveBewerbungenQuery = 'INSERT INTO JobBewerbungArchive (JobArchiveID, BewerbungID, UserID, Vorname, Nachname, Tel, Email, Akzeptiert) VALUES ?';
            const bewerbungenData = bewerbungen.map(bewerbung => [jobID, bewerbung.BewerbungID, bewerbung.UserID, bewerbung.Vorname, bewerbung.Nachname, bewerbung.Tel, bewerbung.Email, bewerbung.Akzeptiert]);
          
            if (bewerbungenData.length > 0) {
              db.query(archiveBewerbungenQuery, [bewerbungenData], (err, archiveBewerbungenResult) => {
                if (err) {
                  console.log('Error archiving job applications:', err);
                  return res.status(500).send({ success: false, error: "Error archiving job applications: " + err.message });
                }
                console.log('Job applications successfully archived');

                // Lösche die Bewerbungen aus der Tabelle "JobBewerbungen"
                db.query('DELETE FROM JobBewerbungen WHERE JobID = ?', [jobID], (err, deleteBewerbungenResult) => {
                  if (err) {
                    console.log('Error deleting job applications:', err);
                    return res.status(500).send({ success: false, error: "Error deleting job applications: " + err.message });
                  }
                  console.log('Job applications deleted from JobBewerbungen');

                  // Lösche den Job aus "jobdaten"
                  db.query('DELETE FROM JobDaten WHERE JobID = ?', [jobID], (err, deleteResult) => {
                    if (err) {
                      console.log('Error deleting the job from jobdaten:', err);
                      return res.status(500).send({ success: false, error: "Error deleting the job from jobdaten: " + err.message });
                    }
                    console.log('Job deleted from jobdaten');
                    res.send({ success: true, message: "Job and applications successfully archived and deleted" });
                  });
                });
              });
            } else {
              console.log('No job applications to archive');

              // Lösche den Job aus "jobdaten"
              db.query('DELETE FROM JobDaten WHERE JobID = ?', [jobID], (err, deleteResult) => {
                if (err) {
                  console.log('Error deleting the job from jobdaten:', err);
                  return res.status(500).send({ success: false, error: "Error deleting the job from jobdaten: " + err.message });
                }
                console.log('Job deleted from jobdaten');
                res.send({ success: true, message: "Job successfully archived and deleted" });
              });
            }
          });
        });
      }
    });
  });
}

function getArchivedJobs(req, res) {
  const userID = req.jwt.userID;
  const jobID = req.params.jobID;

  const query = `
    SELECT 
      ja.Title, 
      ja.Textfeld, 
      ja.Startzeitpunkt, 
      ja.Endzeitpunkt, 
      ja.Vorname, 
      ja.Nachname, 
      ja.Adresse, 
      ja.Plz, 
      ja.Tel
    FROM 
      JobArchive ja
    WHERE 
      ja.JobID = ? AND ja.UserID = ?
  `;

  db.query(query, [jobID, userID], (err, jobResults) => {
    if (err) {
      console.error('Error retrieving archived job details for employer:', err);
      res.status(500).send({ success: false, error: 'Internal server error' });
    } else {
      if (jobResults.length === 0) {
        return res.status(404).send({ success: false, error: 'Archivierter Job nicht gefunden oder Zugriff verweigert' });
      }

      const jobDetails = {
        Title: jobResults[0].Title,
        Textfeld: jobResults[0].Textfeld,
        Startzeitpunkt: jobResults[0].Startzeitpunkt,
        Endzeitpunkt: jobResults[0].Endzeitpunkt,
        Vorname: jobResults[0].Vorname,
        Nachname: jobResults[0].Nachname,
        Adresse: jobResults[0].Adresse,
        Plz: jobResults[0].Plz,
        Tel: jobResults[0].Tel,
        Bewerber: []
      };

      const applicantQuery = `
        SELECT
          jba.BewerbungID,
          jba.UserID AS BewerberID,
          jba.Vorname AS BewerberVorname,
          jba.Nachname AS BewerberNachname,
          jba.Tel AS BewerberTel,
          jba.Email AS BewerberEmail,
          jba.Akzeptiert
        FROM
          JobBewerbungArchive jba
        WHERE
          jba.JobArchiveID = ?
      `;

      db.query(applicantQuery, [jobID], (err, applicantResults) => {
        if (err) {
          console.error('Error retrieving applicants for archived job:', err);
          res.status(500).send({ success: false, error: 'Internal server error' });
        } else {
          jobDetails.Bewerber = applicantResults.map(result => ({
            BewerbungID: result.BewerbungID,
            BewerberID: result.BewerberID,
            Vorname: result.BewerberVorname,
            Nachname: result.BewerberNachname,
            Tel: result.BewerberTel,
            Email: result.BewerberEmail,
            Akzeptiert: result.Akzeptiert
          }));

          res.send({ success: true, data: jobDetails });
        }
      });
    }
  });
}

function getArchivedApplicant(req, res) {
  console.log (req.user);
  const userId = req.jwt.userID;


  db.query('SELECT * FROM JobBewerbungArchive WHERE UserID = ?', [userId], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getArchivedJobsForContractor(req, res) {
  const userID = req.jwt.userID;

  const query = `
    SELECT 
      ja.Title, 
      ja.Textfeld, 
      ja.Startzeitpunkt, 
      ja.Endzeitpunkt, 
      ja.Vorname, 
      ja.Nachname, 
      ja.Adresse, 
      ja.Plz, 
      ja.Tel
    FROM 
      JobArchive ja
      INNER JOIN JobBewerbungArchive jba ON ja.JobArchiveID = jba.JobArchiveID
    WHERE 
      jba.UserID = ? AND jba.Akzeptiert = true
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error('Error retrieving accepted archived jobs for contractor:', err);
      res.status(500).send({ success: false, error: 'Internal server error' });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

module.exports = {
  getAllJobs,
  getJobsByPLZ,
  getMyjob,
  getjob,
  getAllmyjob,
  createJob,
  applyForJob,
  deleteJobApply,
  getjobapply,
  getAlljobapply,
  getAppliedJobs,
  acceptJob,
  denyJob,
  getAcceptedApplicants,
  updateJob,
  deleteJob,
  getArchivedJobs,
  closeAndArchiveJob,
  getArchivedApplicant,
  getArchivedJobsForContractor
};