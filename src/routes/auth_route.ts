import express from 'express';
import auth from '../controllers/auth_controller';

const router = express.Router();

router.post('/login', auth.login);
router.post('/register', auth.register);
router.get('/logout', auth.logout);
router.post('/refresh', auth.refresh);

export default router;
