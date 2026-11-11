// api/delete.js  (pagbura ng record)
const connectToDatabase = require('../db');
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({}, { strict: false });
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model('Attendance', AttendanceSchema, 'Francisco.daily_attendance');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-passcode');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const expected = process.env.ADMIN_PASSCODE;
    if (!expected || req.headers['x-admin-passcode'] !== expected) {
      return res.status(401).json({ error: 'Wrong passcode' });
    }

    const { id } = req.body || {};
    if (!/^[0-9a-fA-F]{24}$/.test(id || '')) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    await connectToDatabase();
    const result = await Attendance.collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Record not found' });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not delete' });
  }
};
