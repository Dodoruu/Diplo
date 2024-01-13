const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.get('/', loanController.getAllLoans);
router.post('/create', loanController.createLoan);
router.post('/accept', loanController.acceptLoan);
router.get('/archive', loanController.getArchivedLoan);

module.exports = router;