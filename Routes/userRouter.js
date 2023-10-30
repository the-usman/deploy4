const express = require('express');
const { SignUpUser, LoginUser, allUser } = require('../Controller/userController');
const fetchUser = require('../Middleware/fetchUser');
const router = express.Router();

router.get('/', fetchUser, allUser);
router.post('/signup', SignUpUser);
router.post('/login', LoginUser);

module.exports = router;
