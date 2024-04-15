const express = require('express');
const router = express.Router();
const postController = require('../controllers/post_controller.js');  

router.get('/', postController.getAllPosts);
router.post('/', postController.addNewPost);  

module.exports = router;
