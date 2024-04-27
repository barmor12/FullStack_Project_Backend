import express from 'express';
const router = express.Router();
import post from '../controllers/post_controller'; 
import authmiddleware from '../common/auth_middleware';

router.get('/',authmiddleware,post.getAllPosts);
router.get('/:id', post.getPostById);
router.post('/', post.addNewPost);  
router.delete('/:id', post.deletePost);
router.put('/:id', post.updatePost);


export = router;
