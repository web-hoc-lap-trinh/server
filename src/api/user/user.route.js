const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

const router = express.Router();

router.get(
    '/profile',
    authMiddleware,
    userController.getProfile
);
router.put(
    '/profile',
    authMiddleware,
    upload.single('avatar'), 
    userController.updateProfile
);

router.delete(
    '/profile',
    authMiddleware,
    userController.deleteProfile
);
module.exports = router;