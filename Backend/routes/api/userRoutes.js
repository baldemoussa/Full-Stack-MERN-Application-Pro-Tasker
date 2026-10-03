const router = require("express").Router();
const userController = require('../../controllers/userController');
const { authMiddleware } = require('../../utils/auth');

// POST /api/users/register - Create a new user
router.post('/register', userController.registerUser);
 
// POST /api/users/login - Authenticate a user and return a token
router.post('/login', userController.loginUser);

// GET /api/users/me - Return the current user
router.get('/me', authMiddleware, userController.getMe);

module.exports = router;