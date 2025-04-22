import { createRent, getAllRents, getRentById } from '../models/rentModel.js';
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

export const handleCreateRent = async (req, res) => {
  try {
    const files = req.files || [];
    const imageFilenames = files.map(file => file.filename);
    const data = req.body;

    const rentId = await createRent(data, imageFilenames);
    res.status(201).json({ success: true, rentId });
  } catch (error) {
    console.error('Create rent error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const handleGetAllRents = async (req, res) => {
  try {
    const rents = await getAllRents();
    res.status(200).json({ success: true, data: rents });
  } catch (error) {
    console.error('Get all rents error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const handleGetRentById = async (req, res) => {
  try {
    const { id } = req.params;
    const rent = await getRentById(id);

    if (!rent) {
      return res.status(404).json({ success: false, message: 'Rent not found' });
    }

    res.status(200).json({ success: true, data: rent });
  } catch (error) {
    console.error('Get rent by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
