const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/all', eventController.getAllEvents);
router.get('/me', eventController.getEventsByPLZ);
router.post('/create', eventController.createEvent);
router.post('/join', eventController.joinEvent);
router.post('/:eventID/close', requireAuth,eventController.closeAndArchiveEvent);
router.get('/archive', requireAuth, eventController.getArchivedEvent);

module.exports = router;
