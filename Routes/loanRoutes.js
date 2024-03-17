const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.get('/all', loanController.getAllLoans);
router.get('/me', loanController.getLoansByPLZ);
router.post('/create', loanController.createLoan);
router.post('/me/apply/:loanID', loanController.applyForLoan);
router.post('/accept', loanController.acceptLoan);
router.post('/:loanID/close', loanController.closeAndArchiveLoan);
router.get('/archive', loanController.getArchivedLoan);
router.delete('/:loanID', loanController.deleteLoan);
router.put('/:loanID', loanController.updateloan);
module.exports = router;