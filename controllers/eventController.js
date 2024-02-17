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
    if (!req.query.plz) { // Note: Express handles empty query params
      res.status(400).send({ success: false, error: "plz was not provided" });
      return;
    }
  
    const plzs = Array.isArray(req.query.plz) ? req.query.plz : [req.query.plz];
  
    const placeholders = plzs.map(() => '?').join(','); 
    const query = `SELECT * FROM EventDaten WHERE plz IN (${placeholders})`;
  
    db.query(query, plzs, (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }


  
  function createEvent(req, res) {
    const { UserID, Title, Textfeld,  Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel } = req.body;
  
    const query = 'INSERT INTO EventDaten (UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, jobID: result.insertId });
      }
    });
  }
  
  function joinEvent(req, res) {
    const { EventID, UserID } = req.body;
  
    const query = 'UPDATE eventDaten SET JoinedByUserID = ? WHERE EventID = ?';
  
    db.query(query, [UserID, EventID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true });
      }
    });
  }
  

  function closeAndArchiveEvent(req, res) {
    const { eventID } = req.params;
    db.query('SELECT * FROM EventDaten WHERE EventID = ?', [eventID], (err, result) => {
        if (err) {
            res.status(500).send({ success: false, error: err.message });
        } else if (result.length > 0) {
            const event = result[0];
            const archiveQuery = 'INSERT INTO Archive (EventID, UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)';
            db.query(archiveQuery, [event.EventID, event.UserID, event.Textfeld, event.Startzeitpunkt, event.Endzeitpunkt, event.Vorname, event.Nachname, event.Adresse, event.PLZ, event.Tel], (err, archiveResult) => {
                if (err) {
                    res.status(500).send({ success: false, error: "Error archiving the event: " + err.message });
                } else {
                    db.query('DELETE FROM EventDaten WHERE EventID = ?', [eventID], (err, deleteResult) => {
                        if (err) {
                            res.status(500).send({ success: false, error: "Error deleting the event: " + err.message });
                        } else {
                            res.send({ success: true, message: "Event successfully archived and deleted" });
                        }
                    });
                }
            });
        } else {
            res.status(404).send({ success: false, error: "Event not found" });
        }
    });
}


function getArchivedEvent(req, res) {
  db.query('SELECT * FROM Archive WHERE EventID IS NOT NULL', (err, results) => {
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
    createEvent,
    joinEvent,
    closeAndArchiveEvent,
    getArchivedEvent
  };
  