// backend/routes/Contact.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); 

router.get('/', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    console.error('GET /api/contact error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    // basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }

    const newMsg = await Contact.create({
      name,
      email,
      phone: phone || '',
      message,
    });

    return res.status(201).json({ message: 'Message received', data: newMsg });
  } catch (err) {
    console.error('POST /api/contact error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
