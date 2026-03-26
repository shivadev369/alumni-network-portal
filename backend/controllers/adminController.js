const User = require("../models/User");
const Post = require("../models/Post");

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.approveUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isApproved: true });
  res.json({ message: "User Approved" });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User Deleted" });
};

exports.analytics = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const pendingApprovals = await User.countDocuments({ isApproved: false });
  const totalPosts = await Post.countDocuments();

  res.json({ totalUsers, pendingApprovals, totalPosts });
};