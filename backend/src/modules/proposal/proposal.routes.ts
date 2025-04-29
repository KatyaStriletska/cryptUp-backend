import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import proposalController from './proposal.controller';

const router = express.Router();
router.get('/proposals', auth(), proposalController.findMany);
router.get('/proposals/:id', auth(), proposalController.findOne);
router.post('/proposals', auth(), proposalController.create);
router.put('/proposals/:id', auth(), proposalController.update);
router.delete('/proposals/:id', auth(), proposalController.remove);

export default router;
