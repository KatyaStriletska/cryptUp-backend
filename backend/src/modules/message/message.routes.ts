import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import messageController from './message.controller';

const router = express.Router();

router.get('/messages', auth(), messageController.findMany);
router.get('/messages/:id', auth(), messageController.findOne);
router.post('/messages', auth(), messageController.create);
router.put('/messages/:id', auth(), messageController.update);
router.delete('/messages/:id', auth(), messageController.remove);

export default router;
