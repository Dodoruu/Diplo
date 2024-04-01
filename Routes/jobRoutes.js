const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../Middleware/authMiddleware');

//Jobs Finden
router.get('/all', jobController.getAllJobs);
router.get('/me', jobController.getJobsByPLZ);


//Bewerbungsinformationen
router.get('/me/:jobID/applicants', authMiddleware, jobController.getjobapply);
router.get('/me/applicants', authMiddleware, jobController.getAlljobapply);
router.get('/me/applys', authMiddleware, jobController.getAppliedJobs);
router.get('/me/accepted/:jobID', authMiddleware, jobController.getAcceptedApplicants);
router.get('/me/acceptedJobs', authMiddleware, jobController.getAcceptedJobs);

//Owner sicht auf seine Jobs
router.get('/me/:jobID', authMiddleware, jobController.getMyjob);
router.get('/my', authMiddleware, jobController.getAllmyjob);

//User sicht auf Job
router.get('/:jobID', jobController.getjob);

//Create Updates und Deletes
router.post('/create', jobController.createJob);
router.delete('/:jobID', authMiddleware, jobController.deleteJob);
router.patch('/:jobID', authMiddleware, jobController.updateJob);


//Anmelden und Abmelden
router.post('/me/apply/:jobID', jobController.applyForJob);
router.delete('/me/apply/:jobID', authMiddleware, jobController.deleteJobApply);

//Annehmen und Ablehnen
router.post('/:jobID/accept', authMiddleware, jobController.acceptJob);
router.post('/:jobID/deny', authMiddleware, jobController.denyJob);


//Archive
router.post('/:jobID/close', authMiddleware, jobController.closeAndArchiveJob);
router.get('/archive/owner', authMiddleware, jobController.getArchivedJobs);
router.get('/archive/applicant', authMiddleware, jobController.getArchivedApplicant);
router.get('/archive/apply', authMiddleware, jobController.getArchivedJobsForContractor);

module.exports = router;