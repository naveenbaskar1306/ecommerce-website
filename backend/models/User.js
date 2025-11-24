const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // ROLE OF USER → admin / artisan / customer
    role: {
      type: String,
      enum: ["admin", "artisan", "customer"],
      default: "customer",
    },

    // ARTISAN APPROVAL (admin must approve)
    isApproved: {
      type: Boolean,
      default: false,
    },

    // EMAIL VERIFICATION FOR ARTISAN
    isVerified: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
