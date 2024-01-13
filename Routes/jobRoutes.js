const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/all', jobController.getAllJobs);
router.post('/me', jobController.getJobsByPLZ);
router.post('/me/apply/:jobID', jobController.applyForJob);
router.post('/create', jobController.createJob);
router.post('/accept', jobController.acceptJob);
router.get('/archive', jobController.getArchivedJobs);

module.exports = router;