const express = require('express');
const users = require('./users');
const posts = require('./posts');
const router = express.Router();

router.use('/users', users);
router.use('/posts', posts);


module.exports = router;

