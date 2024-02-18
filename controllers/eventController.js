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
  
    const query = 'INSERT INTO EventDaten (UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Title, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, eventID: result.insertId });
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
    const { EventID } = req.params;
    const currentUserId = req.user.id; // Aus Authentifizierung abrufen
  
    // Eventdetails für Archiv abrufen, Berechtigungen prüfen
    db.query('SELECT * FROM EventDaten WHERE EventID = ? AND UserID = ?', [EventID, currentUserId], (err, result) => {
      if (err) {
        return res.status(500).send({ success: false, error: "Error fetching event details: " + err.message });
      }
  
      if (result.length === 0) {
        return res.status(404).send({ success: false, error: "event not found or access denied" });
      }
  
      const event = result[0];
  
      // Archivieren (inkl. eventID)
      const archiveQuery = 'INSERT INTO Archive (EventID, UserID, Textfeld, Startzeitpunkt, Endzeitpunkt, Vorname, Nachname, Adresse, plz, Tel) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)';
      db.query(archiveQuery, [event.EventID, event.UserID, event.Textfeld, event.Startzeitpunkt, event.Endzeitpunkt, event.Vorname, event.Nachname, event.Adresse, event.plz, event.Tel], (err, archiveResult) => {
        if (err) {
          return res.status(500).send({ success: false, error: "Error archiving the Event: " + err.message });
        }
  
        // Löschen des Event
        db.query('DELETE FROM EventDaten WHERE EventID = ?', [EventID], (err, deleteResult) => {
          if (err) {
            return res.status(500).send({ success: false, error: "Error deleting the Event: " + err.message });
          }
          res.send({ success: true, message: "Event successfully archived and deleted" });
        });
      });
    });
  }
  
  function getArchivedEvent(req, res) {
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
    getAllEvents,
    getEventsByPLZ,
    createEvent,
    joinEvent,
    closeAndArchiveEvent,
    getArchivedEvent,
    requireAuth
  };
  