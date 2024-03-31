const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../Middleware/authMiddleware');

//events
router.get('/all', eventController.getAllEvents);
router.get('/me', eventController.getEventsByPLZ);

//Anmelden und Abmelden
router.post('/me/:eventID/join', eventController.joinEvent);
router.delete('/me/:eventID/leave', authMiddleware, eventController.leaveEvent);

// User Events
router.get('/:eventID', eventController.getEvent);

//Owner Events
router.get('/me/:eventID', authMiddleware, eventController.getMyEvent);
router.get('/my', authMiddleware, eventController.getAllMyEvents);

// Create Update und Delete Event
router.post('/create', eventController.createEvent);
router.patch('/:eventID', authMiddleware, eventController.updateEvent);
router.delete('/:eventID', authMiddleware, eventController.deleteEvent);





// Get event participants
router.get('/:eventID/participants', eventController.getEventTeilnehmer);
router.get('/me/participants', authMiddleware, eventController.getAllEventTeilnehmer);


//Events an denen ich Teilnehme
router.get('/me/myJoinedEvents/joined', authMiddleware, eventController.getMyJoinedEvents);

// Close and archive event
router.post('/:eventID/close', authMiddleware, eventController.closeAndArchiveEvent);
router.get('/archive/owner', authMiddleware, eventController.getArchivedEvents);
router.get('/archive/participants', authMiddleware, eventController.getArchivedTeilnehmer);

// Get archived events for user
router.get('/archive/user', authMiddleware, eventController.getArchivedEventsForUser);

module.exports = router;
