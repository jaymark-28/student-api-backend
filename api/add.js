// api/add.js  (pagdagdag ng attendance)
const connectToDatabase = require('../db');
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({}, { strict: false });
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model('Attendance', AttendanceSchema, 'Francisco.daily_attendance');

const okKey = k => typeof k === 'string' && k.length > 0 && k.length <= 60 && !k.startsWith('$') && !k.includes('.');
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

    const { match, attKey, date, status } = req.body || {};

    const matchKeys = match && typeof match === 'object' && !Array.isArray(match) ? Object.keys(match) : [];
    const validMatch =
      matchKeys.length > 0 && matchKeys.length <= 6 &&
      matchKeys.every(k => okKey(k) && okText(match[k]));

    if (!validMatch || !okKey(attKey) || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') ||
        !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const clean = {};
    matchKeys.forEach(k => { clean[k] = match[k].trim(); });

    const when = new Date(date + 'T00:00:00.000Z');
    if (isNaN(when)) return res.status(400).json({ error: 'Invalid date' });

    await connectToDatabase();
    const col = Attendance.collection;

    // 1) Kung may entry na sa petsang iyon, i-update ang status
    const upd = await col.updateOne(
      { ...clean, [attKey + '.date']: { $in: [when, when.toISOString()] } },
      { $set: { [attKey + '.$.status']: status } }
    );

    // 2) Kung wala pa, idagdag (o gumawa ng bagong estudyante)
    if (upd.matchedCount === 0) {
      await col.updateOne(
        clean,
        { $push: { [attKey]: { date: when, status } } },
        { upsert: true }
      );
    }

    return res.status(200).json({ ok: true, updated: upd.matchedCount > 0 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not save' });
  }
};