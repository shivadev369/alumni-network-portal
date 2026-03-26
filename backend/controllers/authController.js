const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role, department, batch } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashed,
    role,
    department,
    batch,
    isApproved: false
  });

  res.json({ message: "Registered. Await Admin Approval." });
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email, role });
  if (!user) return res.status(400).json({ message: "Invalid Credentials" });

  if (!user.isApproved && role !== "admin")
    return res.status(403).json({ message: "Awaiting Admin Approval" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid Password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, role: user.role });
};

exports.forgotPassword = async (req, res) => {
  res.json({ message: "Implement email reset via nodemailer." });
};