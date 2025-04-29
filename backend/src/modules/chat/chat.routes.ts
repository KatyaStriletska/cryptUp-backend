import express, { Request } from 'express';
import { auth } from '../../middleware/auth.middleware';
import multer from 'multer';
import { storage } from '../../utils/core/multer.config';
import chatController from './chat.controller';

const router = express.Router();

router.get('/chats', auth(), chatController.findMany);
router.get('/chats/:id', auth(), chatController.findOne);
router.post(
  '/chats',
  multer({
    storage,
    fileFilter: (request: Request, file: Express.Multer.File, callback) => {
      if (
        file.fieldname === 'chat-image' &&
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
      fileSize: 2 * 2 ** 20, // 2 MB
    },
  }).fields([{ name: 'chat-image', maxCount: 1 }]),
  auth(),
  chatController.create,
);
router.put(
  '/chats/:id',
  multer({
    storage,
    fileFilter: (request: Request, file: Express.Multer.File, callback) => {
      if (
        file.fieldname === 'chat-image' &&
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
      fileSize: 2 * 2 ** 20, // 2 MB
    },
  }).fields([{ name: 'chat-image', maxCount: 1 }]),
  auth(),
  chatController.update,
);
router.delete('/chats/:id', auth(), chatController.remove);

export default router;
