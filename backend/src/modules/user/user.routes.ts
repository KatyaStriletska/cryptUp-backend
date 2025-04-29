import express, { Request } from 'express';
import userController from './user.controller';
import { auth } from '../../middleware/auth.middleware';
import multer from 'multer';
import { storage } from '../../utils/core/multer.config';

const router = express.Router();

router.get('/users', auth(), userController.findMany);
router.get('/users/:id', auth(), userController.findOne);
router.post('/users', auth(), userController.create);
router.put(
  '/users/:id',
  multer({
    storage,
    fileFilter: (request: Request, file: Express.Multer.File, callback) => {
      if (
        file.fieldname === 'user-avatar' &&
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
  }).fields([{ name: 'user-avatar', maxCount: 1 }]),
  auth(),
  userController.update,
);
router.delete('/users/:id', auth(), userController.remove);

export default router;
