import express from 'express';
import daoController from './dao.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();
router.get('/daos', auth(), daoController.findMany);
router.get('/daos/:id', auth(), daoController.findOne);
router.post('/daos', auth(), daoController.create);
router.put('/daos/:id', auth(), daoController.update);
router.delete('/daos/:id', auth(), daoController.remove);
router.post('/daos/withdraw', daoController.withdraw);
router.post('/daos/executeProposal', daoController.executeProposal);
router.post('/daos/vote', daoController.vote);
router.post('/daos/changeThreshold', daoController.changeThreshold);

export default router;
