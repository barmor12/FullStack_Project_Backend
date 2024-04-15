const express = require('express');
const router = express.Router();    
const post = require('..controllers/post_controller.js')

router.get('/',post.getAllPosts);

router.post('/', (post.AddNewPost));

module.exports = router;