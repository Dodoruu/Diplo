const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/all', eventController.getAllEvents);
router.get('/me', eventController.getEventsByPLZ);
router.post('/create', eventController.createEvent);
router.patch('/:eventID', authMiddleware, eventController.updateEvent);
router.delete('/:eventID', authMiddleware, eventController.deleteEvent);


//Anmelden und Abmelden
router.post('/me/:eventID/join', eventController.joinEvent);
router.delete('/me/:eventID/leave', authMiddleware, eventController.leaveEvent);


// Get event participants
router.get('/:eventID/participants', eventController.getEventTeilnehmer);
router.get('/me/participants', authMiddleware, eventController.getAllEventTeilnehmer);


//Events an denen ich Teilnehme
router.get('/me/joined', authMiddleware, eventController.getMyJoinedEvents);

// Close and archive event
router.post('/:eventID/close', authMiddleware, eventController.closeAndArchiveEvent);
router.get('/archive/owner', authMiddleware, eventController.getArchivedEvents);
router.get('/archive/participants', authMiddleware, eventController.getArchivedTeilnehmer);

// Get archived events for user
router.get('/archive/user', authMiddleware, eventController.getArchivedEventsForUser);

module.exports = router;
