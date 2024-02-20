const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/:userID', userController.updateUser);
router.delete('/:userID', requireAuth, userController.userDelete);
router.post('/getUserFromToken', userController.getUserFromToken);
router.get('/getUserHasTutorialCompleted', userController.getUserHasTutorialCompleted);
router.post('/setUserHasTutorialCompleted', userController.setUserHasTutorialCompleted);


module.exports = router;
