import express from 'express';
const router = express.Router();
import post from '../controllers/post_controller'; 
import auth from '../controllers/auth_controller'; 

router.get('/',auth.authenticateMiddleware,post.getAllPosts);
router.get('/:id', post.getPostById);
router.post('/', post.addNewPost);  
router.delete('/:id', post.deletePost);
router.put('/:id', post.updatePost);


export = router;
