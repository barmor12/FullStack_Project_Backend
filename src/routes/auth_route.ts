import express from 'express';
import auth from '../controllers/auth_controller';

const router = express.Router();

router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/logout', auth.logout);
router.get('/refresh', auth.refresh);

export default router;
