function getAllEvents(req, res) {
    db.query('SELECT * FROM EventDaten', (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  function createEvent(req, res) {
    const { UserID, Title, Textfeld,  Wann, Adresse, plz, Tel } = req.body;
  
    const query = 'INSERT INTO EventDaten (UserID, Textfeld, Wann,Adresse, Tel) VALUES (?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Title, Textfeld, Wann, Adresse, plz, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, jobID: result.insertId });
      }
    });
  }
  
  function joinEvent(req, res) {
    const { EventID, UserID } = req.body;
  
    const query = 'UPDATE eventDaten SET JoinedByUserID = ? WHERE JobID = ?';
  
    db.query(query, [UserID, EventID], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true });
      }
    });
  }
  
  function getArchivedEvent(req, res) {
    db.query('SELECT * FROM Archive', (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, data: results });
      }
    });
  }
  
  module.exports = {
    getAllEvents,
    createEvent,
    joinEvent,
    getArchivedEvent
  };
  