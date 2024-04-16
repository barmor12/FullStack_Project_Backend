import express from 'express';
const router = express.Router();
import post from '../controllers/post_controller';  

router.get('/', post.getAllPosts);
router.get('/:id', post.getPostById);
router.post('/', post.addNewPost);  

export = router;
