import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import authController from './auth.controller';

const router = express.Router();

router.get('/auth/user', auth(), authController.user);
router.get('/oauth/callback/google', authController.generateGoogleOAuth2Token);
router.post('/oauth/google', authController.generateGoogleOAuth2Url);
router.post('/auth/login/wallet', authController.loginWithWallet);
router.post('/auth/login/google', authController.loginWithGoogle);
router.post('/auth/login/credentials', authController.loginWithCredentials);
router.post('/auth/login/ideaforge', authController.loginWithIdeaforgeToken);
router.post('/auth/register', authController.register);
router.post('/auth/logout', authController.logout);

export default router;
