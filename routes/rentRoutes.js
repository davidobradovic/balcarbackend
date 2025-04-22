import express from 'express';
import { handleCreateRent, handleGetAllRents, handleGetRentById } from '../controllers/rentController';

const router = express.Router();

router.post(
  '/tours',
  upload.array('coverImages', 10), // up to 10 images
  handleCreateRent
);

router.get('/', handleGetAllRents);
router.get('/:id', handleGetRentById);

export default router;
