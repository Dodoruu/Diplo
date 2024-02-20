const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/all', jobController.getAllJobs);
router.get('/me', jobController.getJobsByPLZ);
router.post('/create', jobController.createJob);
router.post('/me/apply/:jobID',  requireAuth, jobController.applyForJob);
router.post('/accept', jobController.acceptJob);
router.post('/:jobID/close', requireAuth, jobController.closeAndArchiveJob); 
router.get('/archive', requireAuth, jobController.getArchivedJobs);
router.delete('/:jobID', requireAuth, jobController.deleteJob);

module.exports = router;