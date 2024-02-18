const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.get('/all', loanController.getAllLoans);
router.get('/me', loanController.getLoansByPLZ);
router.post('/create', loanController.createLoan);
router.post('/me/apply/:loanID',  requireAuth, loanController.applyForLoan);
router.post('/accept', loanController.acceptLoan);
router.post('/:loanID/close', requireAuth, loanController.closeAndArchiveLoan);
router.get('/archive', requireAuth, loanController.getArchivedLoan);

module.exports = router;