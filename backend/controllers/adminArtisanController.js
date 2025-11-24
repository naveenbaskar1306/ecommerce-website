// backend/controllers/adminArtisanController.js
const mongoose = require('mongoose'); 
const User = require('../models/User');

// ---------------------- Get All Artisans ----------------------
exports.getArtisans = async (req, res) => {
  try {
    const artisans = await User.find({ role: "artisan" }).select("-password");

    return res.json({
      success: true,
      artisans
    });
  } catch (err) {
    console.error("getArtisans error:", err);
    return res.status(500).json({ message: "Server error fetching artisans" });
  }
};

// ---------------------- Approve Artisan ----------------------
exports.approveArtisan = async (req, res) => {
  try {
    const artisanId = req.params.id;

    const artisan = await User.findById(artisanId);
    if (!artisan) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    artisan.isApproved = true;
    artisan.isVerified = true;
    await artisan.save();

    return res.json({ success: true, message: "Artisan approved" });
  } catch (err) {
    console.error("approveArtisan error:", err);
    return res.status(500).json({ message: "Server error approving artisan" });
  }
};

// ---------------------- Delete Artisan ----------------------
exports.deleteArtisan = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid artisan id' });
    }

    const artisan = await User.findById(id);
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan not found' });
    }

    // Optional: restrict deleting real admin accounts etc
    if (artisan.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin' });
    }

    await User.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Artisan deleted' });
  } catch (err) {
    console.error('deleteArtisan err:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete artisan' });
  }
};
