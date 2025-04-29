import express from 'express';
import { auth } from '../../middleware/auth.middleware';
// import nftController from './nft.controller';

const router = express.Router();

// router.get('/nft-for-vesting/:investorAddress/:projectName', auth(), nftController.findMany);
export default router;
