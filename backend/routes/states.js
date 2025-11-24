const express = require('express');
const State = require('../models/State');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const states = await State.find().sort({ name: 1 });
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
