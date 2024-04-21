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
          socketid: socket.id,
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
    if (data.topic == "Random") {
      try {
        const count = await Questions.countDocuments({ topic: data.topic });
        for (let i = 0; i < 6; i++) {
          const num = Math.floor(Math.random() * count) + 1;
          const questions = await Questions.find({
            topic: data.topic,
          })
            .skip(num)
            .limit(1)
            .exec();
          if (questions.length == 5) {
            await io
              .to(data.socketid)
              .to(data.mysocketid)
              .emit("accepted", questions);
            questions = [];
          } else {
            let temp = questions[0];
            questions.push(temp);
          }
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const count = await Questions.countDocuments({
          topic: data.topic
        });
        for (let i = 0; i < 6; i++) {
          const num = Math.floor(Math.random() * count) + 1;
          const questions = await Questions.find({
            topic: data.topic,
          })
            .skip(num)
            .limit(1)
            .exec();
          if (questions.length == 5) {
            await io
              .to(data.socketid)
              .to(data.mysocketid)
              .emit("accepted", questions);
            questions = [];
          } else {
            let temp = questions[0];
            questions.push(temp);
          }
        }
      } catch (err) {
        console.log(err);
      }
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