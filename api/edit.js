// api/edit.js  (pag-edit ng existing na record)
const connectToDatabase = require('../db');
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({}, { strict: false });
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model('Attendance', AttendanceSchema, 'Francisco.daily_attendance');

const okKey = k => typeof k === 'string' && k.length > 0 && k.length <= 60 &&
  !k.startsWith('$') && !k.includes('.') && k !== '_id';
const okText = v => typeof v === 'string' && v.trim().length > 0 && v.length <= 100;

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

    const { id, fields, attKey, attendance } = req.body || {};

    const fieldKeys = fields && typeof fields === 'object' && !Array.isArray(fields) ? Object.keys(fields) : [];
    const validFields =
      fieldKeys.length > 0 && fieldKeys.length <= 10 &&
      fieldKeys.every(k => okKey(k) && okText(fields[k]));

    const validAtt =
      Array.isArray(attendance) && attendance.length <= 366 &&
      attendance.every(e => e && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') &&
        ['Present', 'Absent'].includes(e.status));

    if (!/^[0-9a-fA-F]{24}$/.test(id || '') || !validFields || !validAtt ||
        !okKey(attKey) || fieldKeys.includes(attKey)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const set = {};
    fieldKeys.forEach(k => { set[k] = fields[k].trim(); });

    set[attKey] = attendance
      .map(e => ({ date: new Date(e.date + 'T00:00:00.000Z'), status: e.status }))
      .filter(e => !isNaN(e.date))
      .sort((a, b) => a.date - b.date);

    await connectToDatabase();
    const result = await Attendance.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: set }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Record not found' });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not save' });
  }
};
