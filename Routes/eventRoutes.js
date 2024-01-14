const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/all', eventController.getAllEvents);
router.post('/', eventController.getEventsByPLZ);
router.post('/create', eventController.createEvent);
router.post('/join', eventController.joinEvent);
router.get('/archive', eventController.getArchivedEvent);

module.exports = router;
