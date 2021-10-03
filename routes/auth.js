const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // generate new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // creating new user
    const newUser = new User({
      username: username,
      email: email,
      password: hashPassword,
    });
    // saving user and return response
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("enter data carefully");
    } else {
      const user = await User.findOne({ email: email });
      if (user) {
        const comparison = await bcrypt.compare(password, user.password);
        if (user && comparison && user.email === email) {
          res.status(200).send("login success");
        } else {
          return res.status(400).send("login error");
        }
      } else {
        return res.status(400).send("login error");
      }
    }
  } catch (error) {
    res.status(500).send(err);
  }
});

module.exports = router;
