import express from 'express';
import dataAccountController from './data-account.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/data-accounts', auth(), dataAccountController.findMany);
router.get('/data-accounts/:id', auth(), dataAccountController.findOne);
router.post('/data-accounts', auth(), dataAccountController.create);
router.put('/data-accounts/:id', auth(), dataAccountController.update);
router.delete('/data-accounts/:id', auth(), dataAccountController.remove);

export default router;
