import { pool } from '../config/db.js';

export const createRent = async (data, images) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO rent (
        title, description, price, deposit, fuel, passengers, bags, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        data.price,
        data.deposit,
        data.fuel,
        data.passengers,
        data.bags,
        data.type
      ]
    );

    const rentId = result.insertId;

    if (images && images.length > 0) {
      const imageValues = images.map(filename => [rentId, filename]);
      await conn.query(
        'INSERT INTO rent_images (rent_id, filename) VALUES ?',
        [imageValues]
      );
    }

    await conn.commit();
    return rentId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getAllRents = async () => {
  const conn = await pool.getConnection();
  try {
    const [rents] = await conn.query(`
      SELECT 
        r.*,
        GROUP_CONCAT(ri.filename) as images
      FROM rent r
      LEFT JOIN rent_images ri ON r.id = ri.rent_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);

    return rents.map(rent => ({
      ...rent,
      images: rent.images ? rent.images.split(',') : []
    }));
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

export const getRentById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const [rents] = await conn.query(`
      SELECT 
        r.*,
        GROUP_CONCAT(ri.filename) as images
      FROM rent r
      LEFT JOIN rent_images ri ON r.id = ri.rent_id
      WHERE r.id = ?
      GROUP BY r.id
    `, [id]);

    if (rents.length === 0) {
      return null;
    }

    const rent = rents[0];
    return {
      ...rent,
      images: rent.images ? rent.images.split(',') : []
    };
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};
