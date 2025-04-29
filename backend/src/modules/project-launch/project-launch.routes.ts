import express, { Request } from 'express';
import projectLaunchController from './project-launch.controller';
import { auth } from '../../middleware/auth.middleware';
import multer from 'multer';
import { storage } from '../../utils/core/multer.config';

const router = express.Router();

router.get('/project-launches', auth(), projectLaunchController.findMany);
router.get('/project-launches/:id', auth(), projectLaunchController.findOne);
router.post('/project-launches/:id/investors', auth(), projectLaunchController.createInvestor);
router.post(
  '/project-launches',
  multer({
    storage,
    fileFilter: (request: Request, file: Express.Multer.File, callback) => {
      if (
        (file.fieldname === 'team-images' || file.fieldname === 'project-logo') &&
        !(
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/webp'
        )
      ) {
        callback(new Error('Invalid file type'));
      } else {
        callback(null, true);
      }
    },
    limits: {
      fileSize: 10 * 2 ** 20, // 10 MB
    },
  }).fields([
    { name: 'team-images' },
    { name: 'project-documents' },
    { name: 'project-logo', maxCount: 1 },
  ]),
  auth(),
  projectLaunchController.create,
);
router.put(
  '/project-launches/:id',
  multer({
    storage,
    fileFilter: (request: Request, file: Express.Multer.File, callback) => {
      if (
        (file.fieldname === 'team-images' || file.fieldname === 'project-logo') &&
        !(
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/webp'
        )
      ) {
        callback(new Error('Invalid file type'));
      } else {
        callback(null, true);
      }
    },
    limits: {
      fileSize: 10 * 2 ** 20, // 10 MB
    },
  }).fields([
    { name: 'team-images' },
    { name: 'project-documents' },
    { name: 'project-logo', maxCount: 1 },
  ]),
  auth(),
  projectLaunchController.update,
);
router.put(
  '/project-launches/:id/investors/:investorId',
  auth(),
  projectLaunchController.updateInvestor,
);
router.delete('/project-launches/:id', auth(), projectLaunchController.remove);

export default router;
