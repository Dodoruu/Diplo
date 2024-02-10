const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/all', jobController.getAllJobs);
router.get('/me', jobController.getJobsByPLZ);
router.post('/me/apply/:jobID', jobController.applyForJob);
router.post('/create', jobController.createJob);
router.post('/accept', jobController.acceptJob);
router.post('/:JobID/closeAndArchive', jobController.closeAndArchiveJob);
router.get('/archive', jobController.getArchivedJobs);

module.exports = router;