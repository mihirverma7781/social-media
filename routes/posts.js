const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose");
// create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    res.status(500).json("error");
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await Post.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// like a post
router.put("/:id/like", async (req, res) => {
  const post = await Post.findById(req.params.id);
  const currentUser = req.body.userId;
  try {
    if (mongoose.Types.ObjectId.isValid(currentUser)) {
      if (!post.likes.includes(currentUser)) {
        await post.updateOne({ $push: { likes: [currentUser] } });
        res.status(200).json("post liked");
      } else if (post.likes.includes(currentUser)) {
        await post.updateOne({ $pull: { likes: currentUser } });
        res.status(200).json("post unliked");
      }
    } else {
      res.status(404).json("invalid user");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    console.log(post);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a timeline post3
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = User.findById(req.body.userId);
    const userPosts = Post.find({ userId: currentUser._id });
    const friendPost = await Promise.all(
      currentUser.following.map((friendId) => {
       return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPost));
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
