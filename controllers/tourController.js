import { createTour, getAllTours, getTourById } from '../models/tourModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = './uploads';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
export const upload = multer({ storage });

export const handleCreateTour = async (req, res) => {
  try {
    const files = req.files || [];
    const imageFilenames = files.map((file) => file.filename);
    const form = req.body;

    // Parse stringified fields
    const data = {
      ...form,
      subDestinations: JSON.parse(form.subDestinations),
      categoryRatings: JSON.parse(form.categoryRatings),
      included: JSON.parse(form.included),
      excluded: JSON.parse(form.excluded),
      itinerary: JSON.parse(form.itinerary)
    };

    const tourId = await createTour(data, imageFilenames);
    res.status(201).json({ success: true, tourId });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const handleGetAllTours = async (req, res) => {
  try {
    const tours = await getAllTours();
    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    console.error('Get all tours error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const handleGetTourById = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await getTourById(id);
    
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }
    
    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    console.error('Get tour by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};