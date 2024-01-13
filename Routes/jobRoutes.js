const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/', jobController.getAllJobs);
router.post('/create', jobController.createJob);
router.post('/accept', jobController.acceptJob);
router.get('/archive', jobController.getArchivedJobs);

module.exports = router;