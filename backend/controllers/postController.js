const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  const post = await Post.create({
    ...req.body,
    author: req.user.id
  });
  res.json(post);
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find().populate("author", "name department batch");
  res.json(posts);
};

exports.updatePost = async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Post Updated" });
};

exports.deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post Deleted" });
};