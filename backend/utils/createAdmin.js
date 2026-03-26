const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashed,
      role: "admin",
      isApproved: true
    });
    console.log("Admin Created");
  }
};

module.exports = createAdmin;