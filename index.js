const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");

dotenv.config();

const DB = process.env.DATABASE;
mongoose.connect(DB).then(() => {
    console.log("connected to database succesfully");
}).catch(err => console.log(err))

// middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

app.listen(8000, () => {
  console.log("server is started");
});
