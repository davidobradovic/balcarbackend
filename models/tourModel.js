import { pool } from '../config/db.js';

export const createTour = async (data, images) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO tours (
        title, destination, subDestinations, duration, nights, 
        startDate, price, deposit, description, highlights, 
        categoryRatings, included, excluded, itinerary, 
        physicalRating, tripType, visaRequirements
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.destination,
        JSON.stringify(data.subDestinations),
        data.duration,
        data.nights,
        data.startDate,
        data.price,
        data.deposit,
        data.description,
        data.highlights,
        JSON.stringify(data.categoryRatings),
        JSON.stringify(data.included),
        JSON.stringify(data.excluded),
        JSON.stringify(data.itinerary),
        data.physicalRating,
        data.tripType,
        data.visaRequirements || null
      ]
    );

    const tourId = result.insertId;

    if (images && images.length > 0) {
      const imageValues = images.map(filename => [tourId, filename]);
      await conn.query(
        'INSERT INTO tour_images (tour_id, filename) VALUES ?',
        [imageValues]
      );
    }

    await conn.commit();
    return tourId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getAllTours = async () => {
  const conn = await pool.getConnection();
  try {
    const [tours] = await conn.query(`
      SELECT 
        t.*,
        GROUP_CONCAT(ti.filename) as images
      FROM tours t
      LEFT JOIN tour_images ti ON t.id = ti.tour_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    // Parse JSON fields
    return tours.map(tour => ({
      ...tour,
      subDestinations: JSON.parse(tour.subDestinations),
      categoryRatings: JSON.parse(tour.categoryRatings),
      included: JSON.parse(tour.included),
      excluded: JSON.parse(tour.excluded),
      itinerary: JSON.parse(tour.itinerary),
      images: tour.images ? tour.images.split(',') : []
    }));
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

export const getTourById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const [tours] = await conn.query(`
      SELECT 
        t.*,
        GROUP_CONCAT(ti.filename) as images
      FROM tours t
      LEFT JOIN tour_images ti ON t.id = ti.tour_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [id]);

    if (tours.length === 0) {
      return null;
    }

    const tour = tours[0];

    // Parse JSON fields
    return {
      ...tour,
      subDestinations: JSON.parse(tour.subDestinations),
      categoryRatings: JSON.parse(tour.categoryRatings),
      included: JSON.parse(tour.included),
      excluded: JSON.parse(tour.excluded),
      itinerary: JSON.parse(tour.itinerary),
      images: tour.images ? tour.images.split(',') : []
    };
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};