import express from 'express';
import milestoneController from './milestone.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/milestones', auth(), milestoneController.findMany);
router.get('/milestones/:id', auth(), milestoneController.findOne);
router.post('/milestones', auth(), milestoneController.create);
router.post('/milestones/:id/proposals', auth(), milestoneController.handleProposal);
router.put('/milestones/:id', auth(), milestoneController.update);
router.delete('/milestones/:id', auth(), milestoneController.remove);

export default router;
