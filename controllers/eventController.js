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
    const { UserID, Textfeld, Wann, Adresse, Tel } = req.body;
  
    const query = 'INSERT INTO EventDaten (UserID, Textfeld, Wann,Adresse, Tel) VALUES (?, ?, ?, ?, ?, ?)';
  
    db.query(query, [UserID, Textfeld, Wann, Adresse, Tel], (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err.message });
      } else {
        res.send({ success: true, jobID: result.insertId });
      }
    });
  }
  
  function joinEvent(req, res) {
    const { JobID, UserID } = req.body;
  
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
  