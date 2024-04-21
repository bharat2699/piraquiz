import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import 'dotenv/config'
import User from "./user/models/user.js";
import Questions from "./quiz/models/question.js";
import authRouter from './authentication/routes/auth.js';
import questionRouter from './quiz/routes/question.js';
import authGuardMiddleware from "./authentication/utils/authGuardMiddleware.js";

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server);
app.use(authRouter);
app.use(questionRouter);


io.on("connection", async (socket) => {
  console.log("socket connected");

  socket.on("connected", async (data) => {
    try {
      const user = await User.findOneAndUpdate(
        {
          email: data,
        },
        {
          socketId: socket.id,
        }
      );
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("invite", (data) => {
    io.to(data.socketid).emit("invite", data);
  });

  socket.on("rejected", (data) => {
    io.to(data.socketid).emit("rejected", data.message);
  });

  socket.on("accepted", async (data) => {
    try {
      const questions = await Questions.find({ topic: data.topic })
        .limit(6)
        .exec();

      if (questions.length === 6) {
        await io.to(data.socketid).to(data.mysocketid).emit("accepted", questions);
      } else {
        // Handle error: not enough questions available for the topic
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("nextQuestion", async (data) => {
    try {
      const question = await Questions.findOne({ _id: data.questionId });
      if (question) {
        io.to(data.socketid).emit("question", question);
      } else {
        // Handle error: question not found
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("sendmyscore", async (data) => {
    io.to(data.socketid).emit("sendmyscore", data.score);
    console.log("sent score to" + data.socketid + "  " + data.score);
  });

  socket.on("disconnect", async (data) => {
    try {
      const user = await User.findOneAndUpdate(
        {
          email: data,
        },
        {
          socketid: "",
        }
      );
    } catch (e) {
      console.log(e);
    }
  });
});


mongoose.connect(process.env.DB_URL, {
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

app.get("/", authGuardMiddleware, (req, res) => {
  res.send("Your email is" + req.user.email);
});

server.listen(process.env.PORT, () => {
  console.log("Server Sprinting at PORT: " + process.env.PORT);
});