import express from 'express';
import { handleCreateTour, handleGetAllTours, handleGetTourById, upload } from '../controllers/tourController.js';

const router = express.Router();

router.post(
  '/tours',
  upload.array('coverImages', 10), // up to 10 images
  handleCreateTour
);

router.get('/', handleGetAllTours);
router.get('/:id', handleGetTourById);

export default router;
