const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// update
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(400).json({ error: "password not updated" });
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("account has been updated");
    } catch (error) {
      res.status(500).json({ error: "not updated" });
    }
  } else {
    return res
      .status(403)
      .json({ message: "you can update only your account" });
  }
});

// delete
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete({ _id: req.params.id });
      if (user === null) {
        return res.status(400).json({ message: "user not found" });
      } else {
        return res.status(200).json({ message: "account has been deleted" });
      }
    } catch (error) {
      res.status(500).json({ error: "not deleted" });
    }
  } else {
    return res
      .status(403)
      .json({ message: "you can delete only your account" });
  }
});

// get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    const { password, createdAt, updatedAt, isAdmin, ...others } = user._doc;
    if (user === null) {
      return res.status(400).json({ message: "user not found" });
    } else {
      return res.status(200).json({ message: "user found", data: others });
    }
  } catch (error) {
    res.status(500).json({ error: "not found" });
  }
});

// follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const currentUser = await User.findById(req.body.userId);
      const user = await User.findById(req.params.id);
      if (!user.followers.includes(currentUser.id)) {
        await user.updateOne({ $push: { followers: [currentUser.id] } });
        await currentUser.updateOne({ $push: { following: [user.id] } });
        res.status(200).send("you have followed this user");
      } else {
        res.status(403).send("you alrady follow this user");
      }
    } catch (err) {
      res.status(400).json({ message: "user does not exist" });
    }
  } else {
    return res.status(400).json({ message: "you cant follow yourself" });
  }
});

// unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
