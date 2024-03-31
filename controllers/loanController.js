const jwt = require('jsonwebtoken');
const secretKey = 'dein_geheimer_schluessel';

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
  if (!req.query.Plz) {
    res.status(400).send({ success: false, error: "Plz was not provided" });
    return;
  }

  const Plzs = Array.isArray(req.query.Plz) ? req.query.Plz : [req.query.Plz];

  const placeholders = Plzs.map(() => '?').join(','); 
  const query = `SELECT * FROM LoanDaten WHERE Plz IN (${placeholders})`;

  db.query(query, Plzs, (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getmyLoan(req, res) { /* gibt informationen über einen Loan, die LoanID wird in der URL angegeben*/
  if (!req.params.loanID) {
    res.status(400).send({ success: false, error: "LoanID was not provided" });
    return;
  }

  const loanID = req.params.loanID;

  const query = 'SELECT * FROM LoanDaten WHERE LoanID = ?';

  db.query(query, [loanID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ success: false, error: "Loan not found" });
    } else {
      res.send({ success: true, data: results[0] });
    }
  });
}

function getLoan(req, res) { /* gibt informationen über einen Loan, die LoanID wird in der URL angegeben*/
  if (!req.params.loanID) {
    res.status(400).send({ success: false, error: "LoanID was not provided" });
    return;
  }

  const loanID = req.params.loanID;

  const query = 'SELECT * FROM LoanDaten WHERE LoanID = ?';

  db.query(query, [loanID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ success: false, error: "Loan not found" });
    } else {
      res.send({ success: true, data: results[0] });
    }
  });
}

function getAllmyLoans(req, res) { /* gibt informationen über alle Loans die aktiv erstellt sind von mir habe */
  const userID = req.jwt.userID;

  const query = 'SELECT * FROM LoanDaten WHERE UserID = ?';

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function createLoan(req, res) {
  const { UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel, } = req.body;

  const query = 'INSERT INTO LoanDaten (UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, loanID: result.insertId });
    }
  });
}

function applyForLoan(req, res) {
  const { loanID } = req.params;
  const { UserID, Vorname, Nachname, Tel, Email } = req.body;

  const isLoanCreatorQuery = 'SELECT UserID FROM LoanDaten WHERE LoanID = ?';
  db.query(isLoanCreatorQuery, [loanID], (err, creatorResult) => {
    if (err) {
      return res.status(500).send({ success: false, error: err.message });
    }

    if (creatorResult.length === 0) {
      return res.status(404).send({ success: false, error: "Loan not found" });
    }

    const loanCreatorID = creatorResult[0].UserID;

    if (loanCreatorID === UserID) {
      return res.status(400).send({ success: false, error: "User cannot apply for their own loan" });
    }

    const query = 'INSERT INTO LoanBewerbungen (LoanID, UserID, Vorname, Nachname, Tel, Email) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [loanID, UserID, Vorname, Nachname, Tel, Email], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, applicationID: result.insertId });
      }
    });
  });
}

function deleteLoanApply(req, res) {
  const userID = req.jwt.userID;
  const loanID = req.params.loanID;

  const query = `
    DELETE FROM LoanBewerbungen 
    WHERE UserID = ? AND LoanID = ?
  `;

  db.query(query, [userID, loanID], (err, result) => {
    if (err) {
      console.error('Error deleting loan applications:', err);
      res.status(500).send({ success: false, error: 'Internal server error' });
    } else {
      if (result.affectedRows === 0) {
        return res.status(404).send({ success: false, error: 'Keine Bewerbungen für diesen Loan gefunden' });
      }
      res.send({ success: true, message: `${result.affectedRows} Bewerbung(en) erfolgreich gelöscht` });
    }
  });
}

function getLoanapply(req, res) {
  const userID = req.jwt.userID;
  const loanID = req.params.loanID;

  const checkCreatorQuery = 'SELECT COUNT(*) AS count FROM LoanDaten WHERE LoanID = ? AND UserID = ?';
  db.query(checkCreatorQuery, [loanID, userID], (err, creatorResult) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (creatorResult[0].count === 0) {
      res.status(403).send({ success: false, error: 'Zugriff verweigert. Sie sind nicht der Ersteller dieses Loans.' });
      return;
    }

    const query = 'SELECT * FROM LoanBewerbungen WHERE LoanID = ?';
    db.query(query, [loanID], (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  });
}

function getAllLoanapply(req, res) {
  const userID = req.jwt.userID;

  const getLoansQuery = 'SELECT LoanID FROM LoanDaten WHERE UserID = ?';
  db.query(getLoansQuery, [userID], (err, loanResults) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (loanResults.length === 0) {
      res.send({ success: true, data: [] });
      return;
    }

    const loanIDs = loanResults.map(loan => loan.LoanID);

    const getApplicantsQuery = `
      SELECT lb.LoanID, lb.BewerbungID, lb.UserID, lb.Vorname, lb.Nachname, lb.Tel, lb.Email, lb.Akzeptiert
      FROM LoanBewerbungen lb
      WHERE lb.LoanID IN (?)
    `;
    db.query(getApplicantsQuery, [loanIDs], (err, applicantResults) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }

      const applicantsByLoan = {};
      applicantResults.forEach(applicant => {
        if (!applicantsByLoan[applicant.LoanID]) {
          applicantsByLoan[applicant.LoanID] = [];
        }
        applicantsByLoan[applicant.LoanID].push(applicant);
      });

      res.send({ success: true, data: applicantsByLoan });
    });
  });
}

function getAppliedLoans(req, res) {
  const userID = req.jwt.userID;

  const getApplicationsQuery = `
    SELECT lb.LoanID
    FROM LoanBewerbungen lb
    WHERE lb.UserID = ?
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

    const loanIDs = applicationResults.map(application => application.LoanID);

    const getLoansQuery = `
      SELECT ld.LoanID, ld.Title, ld.Textfeld, ld.Startzeitpunkt, ld.Endzeitpunkt, ld.Vorname, ld.Nachname, ld.Adresse, ld.Plz, ld.Tel
      FROM LoanDaten ld
      WHERE ld.LoanID IN (?)
    `;
    db.query(getLoansQuery, [loanIDs], (err, loanResults) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }

      res.send({ success: true, data: loanResults });
    });
  });
}

async function acceptLoan(req, res) {
  const userID = req.jwt.userID;
  const loanID = req.params.loanID;
  const { bewerbungID } = req.body;

  if (!bewerbungID) {
    return res.status(400).send({ success: false, error: 'bewerbungID fehlt' });
  }

  const bewerbungIDInt = parseInt(bewerbungID);

  if (!bewerbungIDInt) {
    return res.status(400).send({ success: false, error: 'bewerbungID ist ungültig' });
  }

  const query = `
    SELECT LoanDaten.UserID 
    FROM LoanBewerbungen 
    INNER JOIN LoanDaten ON LoanBewerbungen.LoanID = LoanDaten.LoanID
    WHERE LoanBewerbungen.BewerbungID = ? AND LoanBewerbungen.LoanID = ?
  `;

  db.query(query, [bewerbungIDInt, loanID], (err, results) => {
    if (err) {
      console.error('Error checking loan ownership:', err);
      res.status(500).send({ success: false, error: 'Fehler bei der Überprüfung der Loan-Eigentümerschaft' });
    } else {
      if (results.length === 0) {
        return res.status(404).send({ success: false, error: 'Bewerbung für diesen Loan nicht gefunden' });
      }

      if (results[0].UserID !== userID) {
        return res.status(403).send({ success: false, error: 'Dieser Loan gehört nicht dem angemeldeten Benutzer' });
      }

      const updateQuery = 'UPDATE LoanBewerbungen SET Akzeptiert = TRUE WHERE BewerbungID = ?';
      db.query(updateQuery, [bewerbungIDInt], (err, _) => {
        if (err) {
          console.error('Error accepting loan application:', err);
          res.status(500).send({ success: false, error: 'Fehler beim Akzeptieren der Bewerbung' });
        } else {
          res.status(200).send({ success: true });
        }
      });
    }
  });
}

async function denyLoan(req, res) {
  const userID = req.jwt.userID;
  const loanID = req.params.loanID;
  const { bewerbungID } = req.body;

  if (!bewerbungID) {
    return res.status(400).send({ success: false, error: 'bewerbungID fehlt' });
  }

  const bewerbungIDInt = parseInt(bewerbungID);

  if (!bewerbungIDInt) {
    return res.status(400).send({ success: false, error: 'bewerbungID ist ungültig' });
  }

  const query = `
    SELECT LoanDaten.UserID 
    FROM LoanBewerbungen 
    INNER JOIN LoanDaten ON LoanBewerbungen.LoanID = LoanDaten.LoanID
    WHERE LoanBewerbungen.BewerbungID = ? AND LoanBewerbungen.LoanID = ?
  `;

  db.query(query, [bewerbungIDInt, loanID], (err, results) => {
    if (err) {
      console.error('Error checking loan ownership:', err);
      res.status(500).send({ success: false, error: 'Fehler bei der Überprüfung der Loan-Eigentümerschaft' });
    } else {
      if (results.length === 0) {
        return res.status(404).send({ success: false, error: 'Bewerbung für diesen Loan nicht gefunden' });
      }

      if (results[0].UserID !== userID) {
        return res.status(403).send({ success: false, error: 'Dieser Loan gehört nicht dem angemeldeten Benutzer' });
      }

      const updateQuery = 'UPDATE LoanBewerbungen SET Akzeptiert = FALSE WHERE BewerbungID = ?';
      db.query(updateQuery, [bewerbungIDInt], (err, _) => {
        if (err) {
          console.error('Error denying loan application:', err);
          res.status(500).send({ success: false, error: 'Fehler beim Ablehnen der Bewerbung' });
        } else {
          res.status(200).send({ success: true });
        }
      });
    }
  });
}

function getAcceptedApplicants(req, res) {
  const userID = req.jwt.userID;
  const loanID = req.params.loanID;

  const checkOwnerQuery = `
    SELECT COUNT(*) AS count
    FROM LoanDaten
    WHERE LoanID = ? AND UserID = ?
  `;
  db.query(checkOwnerQuery, [loanID, userID], (err, ownerResult) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (ownerResult[0].count === 0) {
      res.status(403).send({ success: false, error: 'Zugriff verweigert. Sie sind nicht der Besitzer dieses Loans.' });
      return;
    }

    const getAcceptedApplicantsQuery = `
      SELECT lb.BewerbungID, lb.UserID, lb.Vorname, lb.Nachname, lb.Tel, lb.Email
      FROM LoanBewerbungen lb
      WHERE lb.LoanID = ? AND lb.Akzeptiert = true
    `;
    db.query(getAcceptedApplicantsQuery, [loanID], (err, applicantResults) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }

      res.send({ success: true, data: applicantResults });
    });
  });
}

function updateLoan(req, res) {
  const userID = req.jwt.userID;
  const loanID = req.params.loanID;
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

  const query = `UPDATE LoanDaten SET ${fields.join(', ')} WHERE LoanID = ? AND UserID = ?`;
  values.push(loanID, userID);

  db.query(query, values, (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).send({ success: false, error: 'Loan not found or not authorized' });
    } else {
      res.send({ success: true, result: result });
    }
  });
}

function deleteLoan(req, res) {
  const userID = req.jwt.userID;
  const loanID = req.params.loanID;

  const query = 'DELETE FROM LoanDaten WHERE LoanID = ? AND UserID = ?';
  db.query(query, [loanID, userID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).send({ success: false, error: 'Loan not found or not authorized' });
    } else {
      res.send({ success: true, message: 'Loan deleted successfully' });
    }
  });
}

function closeAndArchiveLoan(req, res) {
  console.log(req.jwt);
  console.log('closeAndArchiveLoan called');
  const { loanID } = req.params;
  console.log('req.params.loanID:', loanID);

  db.query('SELECT * FROM LoanDaten WHERE LoanID = ?', [loanID], (err, result) => {
    console.log('Nach der Abfrage - result:', result);
    if (err) {
      console.log('Error fetching loan details:', err);
      return res.status(500).send({ success: false, error: "Error fetching loan details: " + err.message });
    }
    if (result.length === 0) {
      console.log('Loan not found');
      return res.status(404).send({ success: false, error: "Loan not found" });
    }

    const loan = result[0];

    db.query('SELECT COUNT(*) AS count FROM LoanArchive WHERE LoanID = ?', [loanID], (err, countResult) => {
      if (err) {
        console.log('Error checking LoanArchive:', err);
        return res.status(500).send({ success: false, error: "Error checking LoanArchive: " + err.message });
      }

      const count = countResult[0].count;
      if (count > 0) {
        db.query('DELETE FROM LoanDaten WHERE LoanID = ?', [loanID], (err, deleteResult) => {
          if (err) {
            console.log('Error deleting the loan from loandaten:', err);
            return res.status(500).send({ success: false, error: "Error deleting the loan from loandaten: " + err.message });
          }
          console.log('Loan already archived and deleted from loandaten');
          res.send({ success: true, message: "Loan already archived and deleted from loandaten" });
        });
      } else {
        const archiveQuery = 'INSERT INTO LoanArchive (LoanID, UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(archiveQuery, [loan.LoanID, loan.UserID, loan.Title, loan.Textfeld, loan.Startzeitpunkt, loan.Endzeitpunkt, loan.Vorname, loan.Nachname, loan.Adresse, loan.Plz, loan.Tel], (err, archiveResult) => {
          if (err) {
            console.log('Error archiving the loan:', err);
            return res.status(500).send({ success: false, error: "Error archiving the loan: " + err.message });
          }
          console.log('Loan successfully archived');

          db.query('DELETE FROM LoanBewerbungen WHERE LoanID = ?', [loanID], (err, deleteBewerbungenResult) => {
            if (err) {
              console.log('Error deleting loan applications:', err);
              return res.status(500).send({ success: false, error: "Error deleting loan applications: " + err.message });
            }
            console.log('Loan applications deleted from LoanBewerbungen');

            db.query('DELETE FROM LoanDaten WHERE LoanID = ?', [loanID], (err, deleteResult) => {
              if (err) {
                console.log('Error deleting the loan from loandaten:', err);
                return res.status(500).send({ success: false, error: "Error deleting the loan from loandaten: " + err.message });
              }
              console.log('Loan deleted from loandaten');
              res.send({ success: true, message: "Loan and applications successfully archived and deleted" });
            });
          });
        });
      }
    });
  });
}

function getArchivedLoans(req, res) {
  const userID = req.jwt.userID;

  const query = `
    SELECT *
    FROM 
      LoanArchive ja
    WHERE ja.UserID = ?
  `;

  db.query(query, [userID], (err, loanResults) => {
    if (err) {
      console.error('Error retrieving archived loan details for employer:', err);
      res.status(500).send({ success: false, error: 'Internal server error' });
    } else {
      if (loanResults.length === 0) {
        return res.status(404).send({ success: false, error: 'Archivierte Leihgabe nicht gefunden oder Zugriff verweigert' });
      }

      const archivedLoans = []

      loanResults.forEach((archivedLoan) => {
        const loanDetails = {
          Title: archivedLoan.Title,
          Textfeld: archivedLoan.Textfeld,
          Startzeitpunkt: archivedLoan.Startzeitpunkt,
          Endzeitpunkt: archivedLoan.Endzeitpunkt,
          Vorname: archivedLoan.Vorname,
          Nachname: archivedLoan.Nachname,
          Adresse: archivedLoan.Adresse,
          Plz: archivedLoan.Plz,
          Tel: archivedLoan.Tel,
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
          AND jba.Akzeptiert = 1
        `;

        db.query(applicantQuery, [archivedLoan.JobID], (err, applicantResults) => {
          if (err) {
            console.error('Error retrieving applicants for archived loan:', err);
            res.status(500).send({ success: false, error: 'Internal server error' });
          } else {
            applicantResults.forEach((result) => {
              const bewerber = {
                BewerbungID: result.BewerbungID,
                BewerberID: result.BewerberID,
                Vorname: result.BewerberVorname,
                Nachname: result.BewerberNachname,
                Tel: result.BewerberTel,
                Email: result.BewerberEmail,
                Akzeptiert: result.Akzeptiert
              };
              
              loanDetails.Bewerber.push(bewerber);
            });

         

            archivedLoans.push(loanDetails);

        
            if (archivedLoans.length === loanResults.length) {
              res.send({ success: true, data: archivedLoans });
            }
          }
        });
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

function getArchivedApplicant(req, res) {
  console.log(req.user);
  const userId = req.jwt.userID;

  db.query('SELECT * FROM LoanBewerbungArchive WHERE UserID = ?', [userId], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getArchivedLoansForContractor(req, res) {
  const userID = req.jwt.userID;
  const query = `
    SELECT la.Textfeld, la.Startzeitpunkt, la.Endzeitpunkt, la.Vorname, la.Nachname, la.Adresse, la.Plz, la.Tel
    FROM LoanArchive la
    INNER JOIN LoanBewerbungArchive lba ON la.ArchiveID = lba.LoanArchiveID
    WHERE lba.UserID = ? AND lba.Akzeptiert = true
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error('Error retrieving accepted archived loans for user:', err);
      res.status(500).send({ success: false, error: 'Internal server error' });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getAcceptedLoans(req, res) {
  const userID = req.jwt.userID;


  const getAcceptedLoansQuery = `
  select * from LoanBewerbungen
  left join LoanDaten on LoanBewerbungen.LoanID = LoanDaten.LoanID
  WHERE LoanBewerbungen.UserID = ?
  `;
  db.query(getAcceptedLoansQuery, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (results.length === 0) {
      res.send({ success: true, data: [] });
      return;
    }

    res.send({ success: true, data: results });

  });
}

module.exports = {
  getAllLoans,
  getLoansByPLZ,
  getmyLoan,
  getLoan,
  getAllmyLoans,
  createLoan,
  applyForLoan,
  deleteLoanApply,
  getLoanapply,
  getAllLoanapply,
  getAppliedLoans,
  acceptLoan,
  denyLoan,
  getAcceptedApplicants,
  updateLoan,
  deleteLoan,
  getArchivedLoans,
  closeAndArchiveLoan,
  getArchivedApplicant,
  getArchivedLoansForContractor,
  getAcceptedLoans
};