const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../Middleware/authMiddleware');


//Loans Finden
router.get('/all', loanController.getAllLoans);
router.get('/me', loanController.getLoansByPLZ);

//Owner sicht auf seine Loans
router.get('/me/:loanID', authMiddleware, loanController.getmyLoan);
router.get('/my', authMiddleware, loanController.getAllmyLoans);

//User sicht auf Loan
router.get('/:loanID', loanController.getLoan);

//Create Updates und Deletes
router.post('/create', loanController.createLoan);
router.delete('/:loanID', authMiddleware, loanController.deleteLoan);
router.patch('/:loanID', authMiddleware, loanController.updateLoan);

//Anmelden und Abmelden
router.post('/me/apply/:loanID', loanController.applyForLoan);
router.delete('/me/apply/:loanID', loanController.deleteLoanApply);

//Annehmen und Ablehnen
router.post('/loanID/accept', authMiddleware, loanController.acceptLoan);
router.post('/loanID/deny', authMiddleware, loanController.denyLoan);

//Bewerbungsinformationen
router.get('/me/:loanID/applicants', authMiddleware, loanController.getLoanapply);
router.get('/me/applicants', authMiddleware, loanController.getAllLoanapply);
router.get('/me/applys', authMiddleware, loanController.getAppliedLoans);
router.get('/me/accepted/:loanID', authMiddleware, loanController.getAcceptedApplicants);

//Archive
router.post('/:loanID/close', authMiddleware, loanController.closeAndArchiveLoan);
router.get('/archive/owner', authMiddleware, loanController.getArchivedLoans);
router.get('/archive/applicant', authMiddleware, loanController.getArchivedApplicant);
router.get('/archive/applicant', authMiddleware, loanController.getArchivedLoansForContractor);

module.exports = router;