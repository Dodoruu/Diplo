const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../Middleware/authMiddleware');


//UserDaten
router.get('/', userController.getAllUsers);
router.get('/getUserFromToken', authMiddleware, userController.getUserFromToken);

//Registrieren und Login
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

//Update, PW Ändern ACC Delete
router.patch('/:userID', authMiddleware, userController.updateUser);
router.patch('/change-password', authMiddleware, userController.changePassword);
router.delete('/:userID', authMiddleware, userController.userDelete);

//Tutorial
router.get('/getUserHasTutorialCompleted', userController.getUserHasTutorialCompleted);
router.post('/setUserHasTutorialCompleted', userController.setUserHasTutorialCompleted);


module.exports = router;
