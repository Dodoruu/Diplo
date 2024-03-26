function getAllEvents(req, res) {
  db.query('SELECT * FROM EventDaten', (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getEventsByPLZ(req, res) {
  if (!req.query.Plz) {
    res.status(400).send({ success: false, error: "Plz was not provided" });
    return;
  }

  const Plzs = Array.isArray(req.query.Plz) ? req.query.Plz : [req.query.Plz];

  const placeholders = Plzs.map(() => '?').join(','); 
  const query = `SELECT * FROM EventDaten WHERE Plz IN (${placeholders})`;

  db.query(query, Plzs, (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getMyEvent(req, res) {
  if (!req.params.eventID) {
    res.status(400).send({ success: false, error: "EventID was not provided" });
    return;
  }

  const eventID = req.params.eventID;

  const query = 'SELECT * FROM EventDaten WHERE EventID = ?';

  db.query(query, [eventID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ success: false, error: "Event not found" });
    } else {
      res.send({ success: true, data: results[0] });
    }
  });
}

function getEvent(req, res) {
  if (!req.params.eventID) {
    res.status(400).send({ success: false, error: "EventID was not provided" });
    return;
  }

  const eventID = req.params.eventID;

  const query = 'SELECT * FROM EventDaten WHERE EventID = ?';

  db.query(query, [eventID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (results.length === 0) {
      res.status(404).send({ success: false, error: "Event not found" });
    } else {
      res.send({ success: true, data: results[0] });
    }
  });
}

function getAllMyEvents(req, res) {
  const userID = req.jwt.userID;

  const query = 'SELECT * FROM EventDaten WHERE UserID = ?';

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function createEvent(req, res) {
  const { UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel } = req.body;

  const query = 'INSERT INTO EventDaten (UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, eventID: result.insertId });
    }
  });
}

function joinEvent(req, res) {
  const { eventID } = req.params;
  const { UserID, Vorname, Nachname, Tel, Email } = req.body;

  const query = 'INSERT INTO EventTeilnehmer (EventID, UserID, Vorname, Nachname, Tel, Email) VALUES (?, ?, ?, ?, ?, ?)';

  db.query(query, [eventID, UserID, Vorname, Nachname, Tel, Email], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, teilnehmerID: result.insertId });
    }
  });
}

function leaveEvent(req, res) {
  const userID = req.jwt.userID;
  const eventID = req.params.eventID;

  const query = 'DELETE FROM EventTeilnehmer WHERE UserID = ? AND EventID = ?';

  db.query(query, [userID, eventID], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).send({ success: false, error: 'Teilnahme an diesem Event nicht gefunden' });
    } else {
      res.send({ success: true, message: 'Erfolgreich vom Event abgemeldet' });
    }
  });
}

function updateEvent(req, res) {
  const eventID = req.params.eventID;
  const userID = req.jwt.userID;
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

  const query = `UPDATE EventDaten SET ${fields.join(', ')} WHERE EventID = ? AND UserID = ?`;
  values.push(eventID, userID);

  db.query(query, values, (err, result) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).send({ success: false, error: 'Event not found or not authorized' });
    } else {
      res.send({ success: true, result: result });
    }
  });
}

function deleteEvent(req, res) {
  const userID = req.jwt.userID;
  const eventID = req.params.eventID;

  // Überprüfen, ob der angemeldete Benutzer der Besitzer des Events ist
  const checkOwnerQuery = 'SELECT COUNT(*) AS count FROM EventDaten WHERE EventID = ? AND UserID = ?';
  db.query(checkOwnerQuery, [eventID, userID], (err, ownerResult) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (ownerResult[0].count === 0) {
      res.status(403).send({ success: false, error: 'Zugriff verweigert. Sie sind nicht der Besitzer dieses Events.' });
      return;
    }

    // Löschen der zugehörigen Teilnehmer
    const deleteTeilnehmerQuery = 'DELETE FROM EventTeilnehmer WHERE EventID = ?';
    db.query(deleteTeilnehmerQuery, [eventID], (err, teilnehmerResult) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }

      // Löschen des Events
      const deleteEventQuery = 'DELETE FROM EventDaten WHERE EventID = ?';
      db.query(deleteEventQuery, [eventID], (err, eventResult) => {
        if (err) {
          res.status(500).send({ success: false, error: err.message });
        } else if (eventResult.affectedRows === 0) {
          res.status(404).send({ success: false, error: 'Event not found' });
        } else {
          res.send({ success: true, message: 'Event and associated participants deleted successfully' });
        }
      });
    });
  });
}

function getEventTeilnehmer(req, res) {
  const eventID = req.params.eventID;

  const query = 'SELECT * FROM EventTeilnehmer WHERE EventID = ?';

  db.query(query, [eventID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getAllEventTeilnehmer(req, res) {
  const userID = req.jwt.userID;

  const query = `
    SELECT et.* 
    FROM EventTeilnehmer et
    JOIN EventDaten ed ON et.EventID = ed.EventID
    WHERE ed.UserID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getMyJoinedEvents(req, res) {
  const userID = req.jwt.userID;

  const query = `
    SELECT ed.* 
    FROM EventDaten ed
    JOIN EventTeilnehmer et ON ed.EventID = et.EventID
    WHERE et.UserID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function closeAndArchiveEvent(req, res) {
  const userID = req.jwt.userID;
  const eventID = req.params.eventID;

  // Event-Details abrufen
  const eventQuery = 'SELECT * FROM EventDaten WHERE EventID = ? AND UserID = ?';
  db.query(eventQuery, [eventID, userID], (err, eventResults) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }

    if (eventResults.length === 0) {
      res.status(404).send({ success: false, error: 'Event not found or not authorized' });
      return;
    }

    const event = eventResults[0];

    // Event ins Archiv verschieben
    const archiveEventQuery = 'INSERT INTO EventArchive (EventID, UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, Plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(archiveEventQuery, [event.EventID, event.UserID, event.Title, event.Textfeld, event.Startzeitpunkt, event.Endzeitpunkt, event.Vorname, event.Nachname, event.Adresse, event.Plz, event.Tel], (err, archiveEventResult) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
        return;
      }

      // Teilnehmer ins Archiv verschieben
      const teilnehmerQuery = 'SELECT * FROM EventTeilnehmer WHERE EventID = ?';
      db.query(teilnehmerQuery, [eventID], (err, teilnehmerResults) => {
        if (err) {
          res.status(500).send({ success: false, error: err.message });
          return;
        }

        const archiveTeilnehmerQuery = 'INSERT INTO EventTeilnehmerArchive (EventID, BewerbungID, UserID, Vorname, Nachname, Tel, Email) VALUES ?';
        const teilnehmerData = teilnehmerResults.map(teilnehmer => [eventID, teilnehmer.BewerbungID, teilnehmer.UserID, teilnehmer.Vorname, teilnehmer.Nachname, teilnehmer.Tel, teilnehmer.Email]);

        db.query(archiveTeilnehmerQuery, [teilnehmerData], (err, archiveTeilnehmerResult) => {
          if (err) {
            res.status(500).send({ success: false, error: err.message });
            return;
          }

          // Event und Teilnehmer aus den Originaltabellen löschen
          const deleteEventQuery = 'DELETE FROM EventDaten WHERE EventID = ?';
          db.query(deleteEventQuery, [eventID], (err, deleteEventResult) => {
            if (err) {
              res.status(500).send({ success: false, error: err.message });
              return;
            }

            const deleteTeilnehmerQuery = 'DELETE FROM EventTeilnehmer WHERE EventID = ?';
            db.query(deleteTeilnehmerQuery, [eventID], (err, deleteTeilnehmerResult) => {
              if (err) {
                res.status(500).send({ success: false, error: err.message });
                return;
              }

              res.send({ success: true, message: 'Event and participants archived successfully' });
            });
          });
        });
      });
    });
  });
}

function getArchivedEvents(req, res) {
  const userID = req.jwt.userID;

  const query = 'SELECT * FROM EventArchive WHERE UserID = ?';

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getArchivedTeilnehmer(req, res) {
  const userID = req.jwt.userID;

  const query = `
    SELECT eta.* 
    FROM EventTeilnehmerArchive eta
    JOIN EventArchive ea ON eta.EventID = ea.EventID
    WHERE ea.UserID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}

function getArchivedEventsForUser(req, res) {
  const userID = req.jwt.userID;

  const query = `
    SELECT ea.* 
    FROM EventArchive ea
    JOIN EventTeilnehmerArchive eta ON ea.EventID = eta.EventID
    WHERE eta.UserID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
    } else {
      res.send({ success: true, data: results });
    }
  });
}


module.exports = {
  getAllEvents,
  getEventsByPLZ,
  getMyEvent,
  getEvent,
  getAllMyEvents,
  createEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
  getEventTeilnehmer,
  getAllEventTeilnehmer,
  getMyJoinedEvents,
  closeAndArchiveEvent,
  getArchivedEvents,
  getArchivedTeilnehmer,
  getArchivedEventsForUser
};