import express from 'express';
import sessionController from './session.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/sessions', auth(), sessionController.findMany);
router.get('/sessions/:id', auth(), sessionController.findOne);
router.post('/sessions', auth(), sessionController.create);
router.put('/sessions/:id', auth(), sessionController.update);
router.delete('/sessions/:id', auth(), sessionController.remove);

export default router;
